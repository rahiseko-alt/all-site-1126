import fs from 'fs';
import path from 'path';
import { AGG_DIR } from './config.mjs';
import { state, summary, sessionsSeenSet, sessionFirstDate } from './state.mjs';
import { ensureDir, median, mode, statsOf, finalizeFreqMap, warn } from './utils.mjs';

export function finalizeSignatures(bucketName) {
  const store = state.signatures[bucketName];
  const ngramCounts = { 2: {}, 3: {}, 4: {} };
  for (const seq of store.sequences.values()) {
    for (const n of [2, 3, 4]) {
      for (let i = 0; i + n <= seq.length; i++) {
        const gram = seq.slice(i, i + n).join(' -> ');
        ngramCounts[n][gram] = (ngramCounts[n][gram] || 0) + 1;
      }
    }
  }
  const topNgrams = {};
  for (const n of [2, 3, 4]) {
    topNgrams['gram' + n] = Object.entries(ngramCounts[n])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([sequence, count]) => ({ sequence, count }));
  }
  return {
    top_ngrams: topNgrams,
    grep_3plus_consecutive_runs: store.grep3plus_runs,
    screenshot_to_read_chains: store.screenshot_to_read_chains,
    sessions_counted: store.sequences.size,
  };
}

export function finalizeTokenMap(map) {
  const out = {};
  for (const key of Object.keys(map)) {
    const entry = map[key];
    out[key] = {
      input_tokens: statsOf(entry.input_tokens),
      output_tokens: statsOf(entry.output_tokens),
      cache_read_input_tokens: statsOf(entry.cache_read_input_tokens),
      cache_creation_input_tokens: statsOf(entry.cache_creation_input_tokens),
      model_freq: finalizeFreqMap(entry.model_freq),
    };
  }
  return out;
}

export function finalizeToolFreq(bucketName) {
  const b = state[bucketName].tool;
  return {
    by_project: b.by_project,
    by_session: b.by_session,
    totals: finalizeFreqMap(b.totals),
  };
}

export function finalizeBash(bashObj) {
  return {
    head_freq: finalizeFreqMap(bashObj.head_freq),
    cd_excluded_count: bashObj.cd_excluded_count || 0,
  };
}

export function countBy(arr, field) {
  const out = {};
  for (const item of arr) {
    const v = item[field];
    if (v === null || v === undefined) continue;
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

export function finalizeSummary() {
  const sessionsByProject = {};
  for (const key of sessionsSeenSet) {
    const project = key.split('::')[0];
    sessionsByProject[project] = (sessionsByProject[project] || 0) + 1;
  }
  const dailyCountsMap = {};
  for (const date of sessionFirstDate.values()) {
    dailyCountsMap[date] = (dailyCountsMap[date] || 0) + 1;
  }
  const dailyRaw = Object.entries(dailyCountsMap)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
  const countsOnly = dailyRaw.map((d) => d.count);

  return {
    ...summary,
    sessions_in_window: sessionsSeenSet.size,
    sessions_by_project: sessionsByProject,
    daily_session_counts: {
      raw: dailyRaw,
      median: median(countsOnly),
      mode: mode(countsOnly),
    },
  };
}

export function writeOutputs() {
  ensureDir(AGG_DIR);

  const summaryOut = finalizeSummary();

  const toolFreqOut = {
    main: finalizeToolFreq('main'),
    sidechain: finalizeToolFreq('sidechain'),
  };

  const bashFreqOut = {
    main: finalizeBash(state.main.bash),
    sidechain: finalizeBash(state.sidechain.bash),
    hooks: finalizeBash(state.hooks),
  };

  const webfetchOut = {
    main: finalizeFreqMap(state.main.webfetch.domain_freq),
    sidechain: finalizeFreqMap(state.sidechain.webfetch.domain_freq),
  };

  const skillUsageOut = {
    main: {
      skill_input_freq: finalizeFreqMap(state.main.skill.skill_input_freq),
      attribution_skill_freq: finalizeFreqMap(state.main.skill.attribution_skill_freq),
    },
    sidechain: {
      skill_input_freq: finalizeFreqMap(state.sidechain.skill.skill_input_freq),
      attribution_skill_freq: finalizeFreqMap(state.sidechain.skill.attribution_skill_freq),
    },
  };

  const signaturesOut = {
    main: finalizeSignatures('main'),
    sidechain: finalizeSignatures('sidechain'),
  };

  const rejections = state.askEvents.rejections;
  const askEventsOut = {
    rejections,
    rejections_summary: {
      by_tool: finalizeFreqMap(countBy(rejections, 'tool')),
      by_bash_head: finalizeFreqMap(countBy(rejections.filter((r) => r.bash_head), 'bash_head')),
      by_project: finalizeFreqMap(countBy(rejections, 'project')),
    },
    replay_estimate: {
      main: finalizeFreqMap(state.askEvents.replay_estimate.main),
      sidechain: finalizeFreqMap(state.askEvents.replay_estimate.sidechain),
    },
    gap_estimate: {
      main: {
        by_tool: finalizeFreqMap(state.askEvents.gap_estimate.main.by_tool),
        by_bash_head: finalizeFreqMap(state.askEvents.gap_estimate.main.by_bash_head),
      },
      sidechain: {
        by_tool: finalizeFreqMap(state.askEvents.gap_estimate.sidechain.by_tool),
        by_bash_head: finalizeFreqMap(state.askEvents.gap_estimate.sidechain.by_bash_head),
      },
    },
  };

  const tokensOut = {
    main: {
      by_project: finalizeTokenMap(state.tokens.main.by_project),
      by_date: finalizeTokenMap(state.tokens.main.by_date),
    },
    sidechain: {
      by_project: finalizeTokenMap(state.tokens.sidechain.by_project),
      by_date: finalizeTokenMap(state.tokens.sidechain.by_date),
    },
  };

  fs.writeFileSync(path.join(AGG_DIR, 'summary.json'), JSON.stringify(summaryOut, null, 2), 'utf8');
  fs.writeFileSync(path.join(AGG_DIR, 'tool-freq.json'), JSON.stringify(toolFreqOut, null, 2), 'utf8');
  fs.writeFileSync(path.join(AGG_DIR, 'bash-freq.json'), JSON.stringify(bashFreqOut, null, 2), 'utf8');
  fs.writeFileSync(
    path.join(AGG_DIR, 'webfetch-domains.json'),
    JSON.stringify(webfetchOut, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(AGG_DIR, 'skill-usage.json'),
    JSON.stringify(skillUsageOut, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(AGG_DIR, 'signatures.json'),
    JSON.stringify(signaturesOut, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(AGG_DIR, 'ask-events.json'),
    JSON.stringify(askEventsOut, null, 2),
    'utf8'
  );
  fs.writeFileSync(path.join(AGG_DIR, 'tokens.json'), JSON.stringify(tokensOut, null, 2), 'utf8');

  const parseErrorRatio = summary.total_lines > 0 ? summary.parse_error_lines / summary.total_lines : 0;
  const passSessions = sessionsSeenSet.size >= 100;
  const passParseRatio = parseErrorRatio < 0.001;
  if (passSessions && passParseRatio) {
    warn('SELF-CHECK: PASS');
  } else {
    const reasons = [];
    if (!passSessions) reasons.push('sessions_in_window=' + sessionsSeenSet.size + '<100');
    if (!passParseRatio) reasons.push('parse_error_ratio=' + parseErrorRatio.toFixed(6) + '>=0.001');
    warn('SELF-CHECK: FAIL ' + reasons.join('; '));
  }
}
