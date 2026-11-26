/**
 * scripts/automation/_lib/state.mjs
 *
 * 自動実行 job（feed-fetch / hook-errors / token-audit / gsap-watch / settings-inventory）の
 * 共通 state read/write ライブラリ。vault-sync-state.mjs（scripts/_lib/）を一般化した単一正本。
 *
 * 設計（vault-sync-state.mjs の教訓を踏襲・failures.md 2026-06-20）:
 *  - **副作用ゼロ**: import しただけでは何も起きない（関数呼出でのみ read/write）。末尾 isMain ガードは
 *    直接実行時のみ pure 関数の selftest を走らせる（state ファイルは一切書かない）。
 *  - state は PC ローカル運用情報のため git 管理外（~/.claude/logs/automation/）に置く。
 *  - state 規約（C-R・全 job 共通）: { job, last_run, last_success, warn: null|{message, since}, metrics }。
 *  - 滞留閾値（STALE_DAYS）を本 lib に集約し Tier1 hook / Tier2 check-in が共に import ＝ドリフト排除。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATE_DIR = join(homedir(), '.claude', 'logs', 'automation');

/**
 * 定期実行 job の「最終成功からこの日数を超えたら滞留」閾値（実行間隔 + 余裕）。
 * ここに載る job のみ滞留判定の対象（イベント駆動 job は載せない＝滞留の概念が無い）。
 */
export const STALE_DAYS = {
  'feed-fetch': 3, // 日次
  'hook-errors': 3, // 日次
  'token-audit': 10, // 週次
  'gsap-watch': 10, // 週次
  'settings-inventory': 40, // 月次
};

export function statePath(job) {
  return join(STATE_DIR, `${job}-state.json`);
}

function empty(job) {
  return { job, last_run: null, last_success: null, warn: null, metrics: {} };
}

/** state を読む（不在/破損は空 state を返す・throw しない）。 */
export function readState(job) {
  try {
    return { ...empty(job), ...JSON.parse(readFileSync(statePath(job), 'utf-8')) };
  } catch {
    return empty(job);
  }
}

/**
 * state を patch でマージ書込。書込失敗（ディスク/権限）は best-effort で握り潰し呼出元を止めない
 * （state は補助証跡であり job 本処理を止める理由にしない・vault-sync-state.mjs 踏襲）。
 */
export function writeState(job, patch) {
  const next = { ...readState(job), ...patch, job };
  try {
    if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(statePath(job), JSON.stringify(next, null, 2) + '\n', 'utf-8');
  } catch (e) {
    process.stderr.write(`[automation-state] write failed (${job}): ${e.message}\n`);
  }
  return next;
}

/**
 * job 実行1回分を記録する便宜関数。「実行が完了したか」と「問題を検知したか」を分離する:
 *  - completed=true（既定） → last_run と last_success を今に刻む（＝job は動いた。滞留検知の基準）。
 *  - completed=false        → last_run のみ更新し last_success は据置（＝job がクラッシュ／未完＝滞留を進める）。
 *  - warn=文字列            → 人が見るべき問題を warn にセット（completed と独立）。同一メッセージが継続する
 *                             間は since を保持（問題の初出時刻を失わない）。null で warn 解除（健全）。
 * metrics は既存にマージ（前回値との比較に使う job のため）。
 */
export function recordRun(job, { completed = true, warn = null, metrics = {} } = {}) {
  const now = new Date().toISOString();
  const prev = readState(job);
  // since = 「job が warn 状態に入り、以降まだ健全に戻っていない起点」。件数入り warn（"新着N件"等）で
  // 文言が毎回変わっても、直前も warn なら since を引き継ぐ（メッセージ完全一致に依存しない）。健全に戻ると
  // warn=null になり、次の warn は since が今にリセットされる＝「いつから継続しているか」を正しく保つ。
  const nextWarn = warn ? { message: warn, since: (prev.warn && prev.warn.since) || now } : null;
  return writeState(job, {
    last_run: now,
    last_success: completed ? now : prev.last_success,
    warn: nextWarn,
    metrics: { ...prev.metrics, ...metrics },
  });
}

/** STATE_DIR 内の全 *-state.json を読む（不在は []・破損は _parse_error 印付き）。 */
export function listStates() {
  let files;
  try {
    files = readdirSync(STATE_DIR).filter((f) => f.endsWith('-state.json'));
  } catch {
    return [];
  }
  return files.map((f) => {
    try {
      return JSON.parse(readFileSync(join(STATE_DIR, f), 'utf-8'));
    } catch {
      return { job: f.replace(/-state\.json$/, ''), _parse_error: true };
    }
  });
}

/** ISO 日時からの経過日数（null/不正は Infinity）。 */
export function daysSince(iso, now = Date.now()) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return Math.floor((now - t) / 86400000);
}

/**
 * 全 job state を評価し warn/滞留/破損を配列で返す（Tier1 hook・Tier2 check-in の共通判定実体）。
 * 空配列＝健全。state ファイルが 1 つも無い（job 未登録/未実行）場合も空＝健全（誤 WARN 抑止）。
 */
export function evaluateStates(now = Date.now()) {
  const out = [];
  for (const s of listStates()) {
    if (s._parse_error) {
      out.push({ job: s.job, kind: 'parse', message: 'state JSON parse error' });
      continue;
    }
    if (s.warn && s.warn.message) {
      out.push({ job: s.job, kind: 'warn', message: s.warn.message, since: s.warn.since || null });
    }
    // 滞留判定は STALE_DAYS 登録済みの「定期実行 job」のみ。イベント駆動 job（portfolio-pii 等・
    // 発火間隔が不定）は滞留の概念が無いため対象外＝明示 warn のみ surface する（誤 stale 抑止）。
    const limit = STALE_DAYS[s.job];
    if (limit !== undefined) {
      const d = daysSince(s.last_success, now);
      if (d > limit) {
        const ago = d === Infinity ? 'never' : `${d}d ago`;
        out.push({ job: s.job, kind: 'stale', message: `last success ${ago} (limit ${limit}d)`, since: s.last_success });
      }
    }
  }
  return out;
}

// isMain ガード: 直接実行時のみ pure 関数の selftest を走らせる（state は書かない・副作用ゼロを維持）。
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const cases = [
    ['daysSince(null)==Infinity', daysSince(null) === Infinity],
    ['daysSince(bad)==Infinity', daysSince('not-a-date') === Infinity],
    [
      'daysSince(2d ago)==2',
      daysSince(new Date(Date.now() - 2 * 86400000).toISOString()) === 2,
    ],
    ['STALE_DAYS has feed-fetch', STALE_DAYS['feed-fetch'] === 3],
    ['statePath ends with -state.json', statePath('x').endsWith('x-state.json')],
  ];
  let allPass = true;
  for (const [name, pass] of cases) {
    if (!pass) allPass = false;
    process.stdout.write(`SELFTEST ${name}: ${pass ? 'PASS' : 'FAIL'}\n`);
  }
  process.stdout.write(`SELFTEST OVERALL: ${allPass ? 'PASS' : 'FAIL'}\n`);
  process.exit(allPass ? 0 : 1);
}
