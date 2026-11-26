// scripts/_lib/root-only-hooks.mjs
//
// root 専用 hook 名の single source of truth（副作用ゼロの純データモジュール）。
//
// vibe-base root を $CLAUDE_PROJECT_DIR とした時のみ正しく動作する hook。product に
// 伝播すると解決破綻 or 常時 FAIL するため、伝播（settings.json 登録 + hook ファイル
// 実体コピーの両方）から除外し、manifest の expected_hooks からも除外する。root 正本
// settings.json には残るので司令塔セッションでは正常動作する。
//
// consumers（両者が本リストを import し、定義の二重管理＝ドリフトを構造的に排除する）:
//   - scripts/propagate-hooks.mjs        : 伝播除外（filterRootOnlyHooks / 実体コピー除外 / assertRootOnlyHooksCovered）
//   - scripts/generate-hook-manifest.mjs : SKIP_HOOKS = ROOT_ONLY_HOOK_NAMES ∪ {hook-runner}
//
// 2 系統の root 依存:
//  (a) 子コマンドが products/<X>/... 等を root 基準パスで参照する hook（例: checkin-hook）。
//      $CLAUDE_PROJECT_DIR=product で MODULE_NOT_FOUND。propagate の
//      assertRootOnlyHooksCovered が /products/ 参照を機械検知する。
//  (b) 子コマンドは $CLAUDE_PROJECT_DIR 経由で解決するが、内部で root 限定の資源
//      （portfolio/ ディレクトリ・scripts/build-portfolio.mjs 等）を実行・参照する hook
//      （虎の巻/portfolio 系）。product に配ると当該資源不在で常時 FAIL。静的検知が
//      困難なため本リストへの明示登録で除外する。
export const ROOT_ONLY_HOOK_NAMES = [
  // 注: allow-marker-guard は当初 root-only にしたが、守る対象の pre-bash-destructive.mjs は
  //     全 product に伝播している。root-only だと product セッションでマーカーを自己発行して
  //     その product の destructive gate を無効化できる（2026-07-10 security-reviewer blocking）。
  //     guard のロジックは $CLAUDE_PROJECT_DIR 相対で root 依存が無いため、product にも伝播させて
  //     各 product 直下のマーカーを守る（マスター裁定 2026-07-10・選択肢1）。
  'portfolio-deploy-build-gate',
  'portfolio-generated-guard',
  // 顧客PIIゲートは root の docs/deliverables/ を守り repo 外辞書を読む。product 伝播不要。
  'portfolio-pii-gate',
  // automation state 監視（Tier1）は root の ~/.claude/logs/automation を司令塔視点で読む。product 伝播不要。
  'session-start-automation-warn',
  // 注: plan-daigi-gate / roadmap-state-write-gate / session-start-handover-inject の 3 本は
  //     2026-07-17 まで「roadmap-state.json は root にのみ在る」を理由に root 専用だったが、
  //     H2大義「vibe-base と同等の大義システムを全 product へ配備」により**伝播へ反転**した。
  //     除外の根拠は「器が root にしか無いから」であって「配ってはいけないから」ではなかった。
  //     3 本とも $CLAUDE_PROJECT_DIR 相対でパス解決し、器が無い product では
  //     「H2大義が未確定＝マスターに仰げ」を deny / 注入する（bias to safe）。ここへ戻すな。
  // root config 変更を各 product へ伝播する側。root 専用（product に配ると自己伝播ループの元）。
  'root-config-propagate',
  'session-start-toranomaki',
  'session-start-vault-reflection-check',
  'toranomaki-generated-guard',
];
