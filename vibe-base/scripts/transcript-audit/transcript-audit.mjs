#!/usr/bin/env node
// transcript-audit.mjs
// Audits Claude Code transcript JSONL files under C:/Users/user/.claude/projects/
// All console output is ASCII-only (Windows cp932 mojibake avoidance).
// Writes utf8 JSON outputs under logscan/agg/.

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { pathToFileURL } from 'node:url';
import { PROJECTS_ROOT, AGG_DIR, WINDOW_START_ISO, WINDOW_END_ISO, WINDOW_START, WINDOW_END, SETTINGS_PATHS, MAX_LINE_BYTES, GAP_THRESHOLD_MS } from './lib/config.mjs';
import { asciiSafe, log, warn, ensureDir, median, mode, bump, bumpNested, finalizeFreqMap, numOr0, statsOf } from './lib/utils.mjs';
import { isHookCommand, splitBashCommand, splitWhitespace, stripQuotes, basenameIfPath, normalizeBashHead, bashRuleMatches, isCommandAllowed, parseBashRule, extractBashAllowRules, loadSettingsAllowRules, runSelfTest } from './lib/bash-parse.mjs';
import { state, summary, sessionsSeenSet, sessionFirstDate } from './lib/state.mjs';
import { listAllFiles, streamProcessFile, findFirstTimestamp } from './lib/ingest.mjs';
import { writeOutputs } from './lib/finalize.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bash command parsing helpers (manual scanning, no regex needing escapes)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Settings-based allow-rule matching (ask replay estimate, item 7a)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// --selftest
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Global aggregation state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Signature sequence tracking (item 5)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Token accounting (item 8)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Record processing
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Finalize + write outputs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) {
    runSelfTest();
    return;
  }

  const onlyIdx = args.indexOf('--only');
  const onlyFile = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

  state.allowRules = loadSettingsAllowRules();
  log('allow_rules_loaded=' + state.allowRules.length);

  let fileList;
  if (onlyFile) {
    const project = path.basename(path.dirname(onlyFile));
    fileList = [{ project, file: onlyFile }];
    log('mode=only file=' + onlyFile + ' project=' + project);
  } else {
    fileList = listAllFiles();
    log('mode=full files_discovered=' + fileList.length);
  }

  let idx = 0;
  for (const { project, file } of fileList) {
    idx++;
    if (onlyFile || idx % 25 === 0 || idx === fileList.length) {
      log('progress ' + idx + '/' + fileList.length + ' project=' + project);
    }
    summary.files_scanned++;

    let inWindow = true;
    if (!onlyFile) {
      const firstTs = await findFirstTimestamp(file);
      if (firstTs === null || firstTs < WINDOW_START || firstTs > WINDOW_END) {
        inWindow = false;
      }
    }

    if (!inWindow) {
      summary.files_skipped++;
      continue;
    }

    summary.files_in_window++;
    try {
      await streamProcessFile(file, project);
    } catch (e) {
      warn('WARN: failed to stream file ' + path.basename(file) + ': ' + e.message);
    }
  }

  writeOutputs();
  log('DONE');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    warn('FATAL: ' + (e && e.stack ? e.stack : String(e)));
    process.exit(1);
  });
}
