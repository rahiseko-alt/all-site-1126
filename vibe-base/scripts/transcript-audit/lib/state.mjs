import { WINDOW_START_ISO, WINDOW_END_ISO } from './config.mjs';

export function emptyBucketTool() {
  return { by_project: {}, by_session: {}, totals: {} };
}
export function emptyBucketBash() {
  return { head_freq: {}, cd_excluded_count: 0 };
}
export function emptyBucketWebfetch() {
  return { domain_freq: {} };
}
export function emptyBucketSkill() {
  return { skill_input_freq: {}, attribution_skill_freq: {} };
}
export function emptySignatureStore() {
  return { sequences: new Map(), grep3plus_runs: 0, screenshot_to_read_chains: 0 };
}

export const state = {
  main: {
    tool: emptyBucketTool(),
    bash: emptyBucketBash(),
    webfetch: emptyBucketWebfetch(),
    skill: emptyBucketSkill(),
  },
  sidechain: {
    tool: emptyBucketTool(),
    bash: emptyBucketBash(),
    webfetch: emptyBucketWebfetch(),
    skill: emptyBucketSkill(),
  },
  hooks: emptyBucketBash(),
  signatures: { main: emptySignatureStore(), sidechain: emptySignatureStore() },
  tokens: {
    main: { by_project: {}, by_date: {} },
    sidechain: { by_project: {}, by_date: {} },
  },
  askEvents: {
    rejections: [],
    replay_estimate: { main: {}, sidechain: {} },
    gap_estimate: {
      main: { by_tool: {}, by_bash_head: {} },
      sidechain: { by_tool: {}, by_bash_head: {} },
    },
  },
  allowRules: [],
};

export const summary = {
  period: { start: WINDOW_START_ISO, end: WINDOW_END_ISO },
  files_scanned: 0,
  files_in_window: 0,
  files_skipped: 0,
  parse_error_lines: 0,
  total_lines: 0,
  large_line_meta_only: 0,
  runtime_error_lines: 0,
};

export const sessionsSeenSet = new Set();
export const sessionFirstDate = new Map();
