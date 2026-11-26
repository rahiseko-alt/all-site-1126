import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { PROJECTS_ROOT, MAX_LINE_BYTES, GAP_THRESHOLD_MS } from './config.mjs';
import { state, summary, sessionsSeenSet, sessionFirstDate } from './state.mjs';
import { bump, bumpNested, numOr0, warn } from './utils.mjs';
import { isHookCommand, splitBashCommand, normalizeBashHead, isCommandAllowed } from './bash-parse.mjs';

export function pushSequenceToken(bucketName, project, sessionId, token) {
  const key = project + '::' + sessionId;
  const store = state.signatures[bucketName];
  if (!store.sequences.has(key)) store.sequences.set(key, []);
  const seq = store.sequences.get(key);
  seq.push(token);
  const n = seq.length;

  if (token === 'Grep') {
    let runLen = 0;
    for (let i = n - 1; i >= 0; i--) {
      if (seq[i] === 'Grep') runLen++;
      else break;
    }
    if (runLen === 3) store.grep3plus_runs++;
  }

  if (n >= 2) {
    const prev = seq[n - 2];
    if (prev.toLowerCase().indexOf('screenshot') !== -1 && token === 'Read') {
      store.screenshot_to_read_chains++;
    }
  }
}

export function addTokenEntry(map, key, usage, model) {
  if (!map[key]) {
    map[key] = {
      input_tokens: [],
      output_tokens: [],
      cache_read_input_tokens: [],
      cache_creation_input_tokens: [],
      model_freq: {},
    };
  }
  const entry = map[key];
  entry.input_tokens.push(numOr0(usage.input_tokens));
  entry.output_tokens.push(numOr0(usage.output_tokens));
  entry.cache_read_input_tokens.push(numOr0(usage.cache_read_input_tokens));
  entry.cache_creation_input_tokens.push(numOr0(usage.cache_creation_input_tokens));
  if (model) entry.model_freq[model] = (entry.model_freq[model] || 0) + 1;
}

export function recordTokens(bucketName, project, dateStr, usage, model) {
  const bucket = state.tokens[bucketName];
  addTokenEntry(bucket.by_project, project, usage, model);
  if (dateStr) addTokenEntry(bucket.by_date, dateStr, usage, model);
}

export function extractToolResultText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((b) => (b && typeof b.text === 'string' ? b.text : '')).join(String.fromCharCode(10));
  }
  return '';
}

export function trackSession(project, sessionId, dateStr) {
  if (typeof sessionId !== 'string' || !sessionId) return;
  const key = project + '::' + sessionId;
  sessionsSeenSet.add(key);
  if (dateStr && !sessionFirstDate.has(key)) {
    sessionFirstDate.set(key, dateStr);
  }
}

export function handleToolUse(bucketName, project, sessionId, dateStr, timestamp, block, ctx) {
  const bucket = state[bucketName];
  const name = block.name || 'Unknown';

  bumpNested(bucket.tool.by_project, project, name);
  bumpNested(bucket.tool.by_session, project + '::' + sessionId, name);
  bump(bucket.tool.totals, name);

  let bashHeadKey = null;
  let isHookCmd = false;

  if (name === 'Bash' && block.input && typeof block.input.command === 'string') {
    const cmd = block.input.command;
    isHookCmd = isHookCommand(cmd);
    const segments = splitBashCommand(cmd);
    const targetBucket = isHookCmd ? state.hooks : bucket.bash;
    for (const seg of segments) {
      const norm = normalizeBashHead(seg);
      if (!norm) continue;
      if (norm.isCd) {
        targetBucket.cd_excluded_count = (targetBucket.cd_excluded_count || 0) + 1;
        continue;
      }
      bump(targetBucket.head_freq, norm.key);
      if (!bashHeadKey) bashHeadKey = norm.key;
    }

    if (!isHookCmd) {
      const allowed = isCommandAllowed(cmd.trim(), state.allowRules);
      if (!allowed) {
        bump(state.askEvents.replay_estimate[bucketName], bashHeadKey || 'unknown');
      }
    }
  }

  if (name === 'WebFetch' && block.input && typeof block.input.url === 'string') {
    try {
      const u = new URL(block.input.url);
      bump(bucket.webfetch.domain_freq, u.hostname);
    } catch (e) {
      bump(bucket.webfetch.domain_freq, 'invalid-url');
    }
  }

  if (name === 'Skill' && block.input && typeof block.input.skill === 'string') {
    bump(bucket.skill.skill_input_freq, block.input.skill);
  }

  if (!isHookCmd) {
    const token = name === 'Bash' ? 'Bash:' + (bashHeadKey || 'unknown') : name;
    pushSequenceToken(bucketName, project, sessionId, token);
  }

  ctx.pendingToolUse.set(block.id, {
    name,
    bashHeadKey,
    timestamp,
    project,
    sessionId,
    bucketName,
    isHookCmd,
  });
}

export function handleToolResult(bucketName, project, sessionId, dateStr, timestamp, block, ctx) {
  const pending = ctx.pendingToolUse.get(block.tool_use_id);
  const text = extractToolResultText(block.content);
  const rejectionPhrase = "The user doesn't want to proceed with this tool use";
  const isRejection = typeof text === 'string' && text.indexOf(rejectionPhrase) !== -1;

  if (pending) {
    const t0 = Date.parse(pending.timestamp);
    const t1 = Date.parse(timestamp);
    if (!Number.isNaN(t0) && !Number.isNaN(t1)) {
      const gap = t1 - t0;
      if (gap > GAP_THRESHOLD_MS) {
        bump(state.askEvents.gap_estimate[pending.bucketName].by_tool, pending.name);
        if (pending.name === 'Bash' && pending.bashHeadKey) {
          bump(state.askEvents.gap_estimate[pending.bucketName].by_bash_head, pending.bashHeadKey);
        }
      }
    }
    if (isRejection) {
      state.askEvents.rejections.push({
        bucket: pending.bucketName,
        tool: pending.name,
        bash_head: pending.name === 'Bash' ? pending.bashHeadKey : null,
        project: pending.project,
        date: dateStr,
      });
    }
    ctx.pendingToolUse.delete(block.tool_use_id);
  } else if (isRejection) {
    state.askEvents.rejections.push({
      bucket: bucketName,
      tool: 'unknown',
      bash_head: null,
      project,
      date: dateStr,
    });
  }
}

export function processRecord(obj, ctx) {
  if (obj.isMeta === true) return;

  const bucketName = obj.isSidechain === true ? 'sidechain' : 'main';
  const bucket = state[bucketName];
  const sessionId = typeof obj.sessionId === 'string' ? obj.sessionId : null;
  const dateStr = typeof obj.timestamp === 'string' ? obj.timestamp.slice(0, 10) : null;
  const project = ctx.project;

  if (sessionId) trackSession(project, sessionId, dateStr);

  if (obj.type === 'assistant' && obj.message) {
    if (obj.message.usage) {
      recordTokens(bucketName, project, dateStr, obj.message.usage, obj.message.model);
    }
    if (obj.attributionSkill) {
      bump(bucket.skill.attribution_skill_freq, obj.attributionSkill);
    }
    const content = obj.message.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block && block.type === 'tool_use') {
          handleToolUse(bucketName, project, sessionId, dateStr, obj.timestamp, block, ctx);
        }
      }
    }
  } else if (obj.type === 'user' && obj.message) {
    const content = obj.message.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block && block.type === 'tool_result') {
          handleToolResult(bucketName, project, sessionId, dateStr, obj.timestamp, block, ctx);
        }
      }
    }
  }
}

export function findField(line, fieldName) {
  const needle = '"' + fieldName + '":"';
  const idx = line.indexOf(needle);
  if (idx === -1) return null;
  const start = idx + needle.length;
  const end = line.indexOf('"', start);
  if (end === -1) return null;
  return line.slice(start, end);
}

export function extractMetaFast(line) {
  return {
    type: findField(line, 'type'),
    sessionId: findField(line, 'sessionId'),
    timestamp: findField(line, 'timestamp'),
    isSidechain: line.indexOf('"isSidechain":true') !== -1,
    isMeta: line.indexOf('"isMeta":true') !== -1,
  };
}

export function handleLine(line, ctx) {
  summary.total_lines++;
  const byteLen = Buffer.byteLength(line, 'utf8');
  if (byteLen > MAX_LINE_BYTES) {
    summary.large_line_meta_only++;
    const meta = extractMetaFast(line);
    if (!meta.isMeta && meta.sessionId) {
      const dateStr = meta.timestamp ? meta.timestamp.slice(0, 10) : null;
      trackSession(ctx.project, meta.sessionId, dateStr);
    }
    return;
  }
  let obj;
  try {
    obj = JSON.parse(line);
  } catch (e) {
    summary.parse_error_lines++;
    return;
  }
  try {
    processRecord(obj, ctx);
  } catch (e) {
    summary.runtime_error_lines++;
  }
}

export function streamProcessFile(filePath, project) {
  return new Promise((resolve, reject) => {
    const ctx = { project, pendingToolUse: new Map() };
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on('line', (line) => handleLine(line, ctx));
    rl.on('close', () => resolve());
    stream.on('error', (e) => reject(e));
  });
}

export function findFirstTimestamp(filePath) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let resolved = false;
    let count = 0;
    const finish = (val) => {
      if (resolved) return;
      resolved = true;
      rl.close();
      stream.destroy();
      resolve(val);
    };
    rl.on('line', (line) => {
      if (resolved) return;
      count++;
      if (Buffer.byteLength(line, 'utf8') > MAX_LINE_BYTES) {
        if (count > 500) finish(null);
        return;
      }
      let obj;
      try {
        obj = JSON.parse(line);
      } catch (e) {
        if (count > 500) finish(null);
        return;
      }
      if (obj && typeof obj.timestamp === 'string') {
        const t = Date.parse(obj.timestamp);
        if (!Number.isNaN(t)) {
          finish(t);
          return;
        }
      }
      if (count > 500) finish(null);
    });
    rl.on('close', () => finish(null));
    stream.on('error', () => finish(null));
  });
}

export function listAllFiles() {
  const files = [];
  let dirs;
  try {
    dirs = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch (e) {
    warn('FATAL: cannot read PROJECTS_ROOT: ' + e.message);
    return files;
  }
  for (const d of dirs) {
    const dirPath = path.join(PROJECTS_ROOT, d.name);
    let entries;
    try {
      entries = fs.readdirSync(dirPath);
    } catch (e) {
      continue;
    }
    for (const e of entries) {
      if (e.endsWith('.jsonl')) {
        files.push({ project: d.name, file: path.join(dirPath, e) });
      }
    }
  }
  return files;
}
