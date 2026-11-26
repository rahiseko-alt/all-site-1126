// scripts/_lib/canonical-allow.mjs
//
// allow permission の single source of truth（副作用ゼロの純データモジュール）。
// root 正本 settings.json の permissions.allow から、root を含む全 product へ
// scripts/propagate-hooks.mjs が union 伝播する（root-only-hooks.mjs と同パターン）。
//
// 出典: docs/audits/ops-improvement-scan-2026-07.md リスト②（A-1〜A-21）
//       plan: ~/.claude/plans/temporal-gliding-turing.md
//
// マスター確定事項（変更禁止・逸脱はマスター承認必須）:
//   - A-9 は sed -n のみ・awk 全般は不採用（広範 awk allow は書かない）
//   - A-12(for) / A-13(timeout) は不採用（広範allow非推奨・ask維持）
//   - A-18(github.io ワイルドカード) は不採用
//   - A-20(path-resolver 代入プレフィックス) は 2026-07-10 実機プローブで FAIL 確定
//     （env代入プレフィックス形は前方一致しない）。allow ルールは追加しない。
//     代替: skill 正本（rahiseko-alt/claude-skills-base）の SKILL.md を
//     シェル変数を使わない2段記法へ改修する（別 repo・別 commit）。
//   - A-21(一回性Bash棚卸し) は削除作業でありルール追加ではないため本モジュール対象外
//   - A-14(PYTHONUTF8=1 python*) は 2026-07-10 実機プローブで PASS したが、
//     security-reviewer 反証で `python*`/`python3*` が任意引数（-c 任意コード含む）に
//     前方一致し、G2 の WebFetch ドメイン制限を迂回する直接ネットワークアクセス+
//     シークレット読出し経路になると判明（blocking）。採用しない
//   - A-10(sed -n) は当初 G1 採用していたが、security-reviewer 反証で
//     `sed -n -i '...' file`（GNU sed は -n と -i を併記可）が prefix match で
//     許可されてしまい in-place 書換に転用できると判明（blocking）。採用しない
//   - A-11(export PATH=) は当初 `export PATH=*` で採用していたが、security-reviewer
//     反証で PATH 全置換（`export PATH=/evil/bin`）も前方一致し PATH ハイジャックの
//     土台になると判明。既存 $PATH を literal 前置で温存する形
//     `export PATH=$PATH:*` に限定して採用（全置換は ask 維持）

// G1: Bash 読取専用・可逆群
export const CANONICAL_ALLOW_BASH_READONLY = [
  'Bash(sleep:*)',
  'Bash(head:*)',
  'Bash(tail:*)',
  'Bash(test:*)',
  'Bash(date)',
  'Bash(date:*)',
  'Bash(pwd)',
  'Bash(pwd:*)',
  'Bash(printf:*)',
  'Bash(which:*)',
  'Bash(notepad:*)',
  'Bash(notepad.exe:*)',
  'Bash(export PATH=$PATH:*)',
];

// G2: WebFetch ドメイン群（自社ドメイン + feed-check 固定ソース）
export const CANONICAL_ALLOW_WEBFETCH = [
  'WebFetch(domain:kouheikosehira.com)',
  'WebFetch(domain:*.kouheikosehira.com)',
  'WebFetch(domain:hnrss.org)',
  'WebFetch(domain:openai.com)',
  'WebFetch(domain:zenn.dev)',
  'WebFetch(domain:rss.itmedia.co.jp)',
  'WebFetch(domain:goworkship.com)',
  'WebFetch(domain:www.nippon.com)',
  'WebFetch(domain:www.technologyreview.jp)',
  'WebFetch(domain:gsap.com)',
  'WebFetch(domain:prtimes.jp)',
  'WebFetch(domain:note.com)',
  'WebFetch(domain:www.anthropic.com)',
];

// G3: 条件付き。2026-07-10 実機プローブ: A-14 PASS・A-20 FAIL。
// A-14 はその後 security-reviewer 反証で不採用（上記コメント参照）のため空。
export const CANONICAL_ALLOW_CONDITIONAL = [];

// G4 は spire-lite 製品限定のため propagate 対象外（products/spire-lite/.claude/settings.local.json に直接配置）

export const CANONICAL_ALLOW = [
  ...CANONICAL_ALLOW_BASH_READONLY,
  ...CANONICAL_ALLOW_WEBFETCH,
  ...CANONICAL_ALLOW_CONDITIONAL,
];
