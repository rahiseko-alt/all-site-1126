// scripts/_lib/negative-feedback-dict.mjs
//
// 失敗自己学習ループ用の否定的フィードバック語彙・閾値の single source of truth
// （副作用ゼロの純データモジュール）。

// S層: 単独で FB event 確定（score 2）
export const STRONG_PATTERNS = [
  '何回目', '前も言った', '前にも言った', 'また同じ', '同じ指摘', '同じミス',
  'あほ', 'アホ', 'ぼけ', 'ボケ', 'ばかか', 'バカか', 'いかれてる',
  'ふざけ', '話にならない', 'やり直せ', '0点', '０点', 'くそだな', '使えない',
  '読んでない', '聞いてない', '無視するな', '勝手にやるな', '勝手に決めるな'
];
// W層: 文脈条件付き（score 1）— 条件は判定ロジック側で評価
export const WEAK_PATTERNS = [
  '違う', 'ちがう', '戻せ', '止めろ', 'やめろ', 'まて', '待て', 'おい', 'なんで',
  'だめ', 'ダメ', 'いらない', 'そうじゃない', 'そっちじゃない'
];
// 除外: この文字列を含む user メッセージは走査対象外
export const EXCLUDE_MARKERS = [
  '<command-message>', '<command-name>', '<local-command', '<system-reminder',
  '[Request interrupted', '<task-notes>', '<teisei>'
];
// 閾値（正本。変更はマスターゲート必須）
export const THRESHOLDS = {
  EVENT_SCORE: 2,
  SHORT_MSG_CHARS: 30,
  LONG_MSG_CHARS: 400,
  BURST_WINDOW: 10,
  BURST_MIN_HITS: 3,
  RECUR_JACCARD: 0.35,
  RECUR_MIN_TOKENS: 3,
  TOP_N: 3,
  WARN_LINES_MAX: 8,
  STALE_DAYS: 7,
  DICT_REJECT_RATE: 0.5,
  HOOK_WINDOW_DAYS: 30,
  HOOK_DEAD_DAYS: 90,
  HOOK_OVERBLOCK_RATE: 0.2,
  HOOK_OVERBLOCK_MIN: 10
};
// 再発照合の distinctive token から除外する一般語（頻出 stop-token）
export const STOP_TOKENS = [
  '実装', '対応', '確認', '修正', '禁止', '再発', '防止', 'スクリプト',
  '失敗', '検証', 'ファイル', '処理', '追加', '削除', '変更', 'セッション'
];
