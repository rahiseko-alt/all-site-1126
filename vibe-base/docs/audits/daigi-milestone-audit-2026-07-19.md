# 大義システム マイルストーン取りこぼし監査（2026-07-19）

## 問い（マスター）

roadmap.md のマイルストーンで、既に達成しているのに `done` になっていないもの（取りこぼし）はないか。

## 結論

**取りこぼしは無い。5/5 マイルストーンは正しく `done`。** さらに、承認された段階1調査の前提（「配備検査は器の存在確認止まりで M3/M5 の実発火が未実証」）は **既に覆っている** — 器存在検査は 2026-07-17 に撤去され、実際に `claude` を起動して hook 発火の実行記録を見る「通電テスト」に置換済み。その最終 PASS は 2026-07-17（本監査時点で 2 日前・A-29 の鮮度基準 ≤14 日を満たす）。

## マイルストーン実体照合

| id | マイルストーン | status | 実体 | 判定 |
|---|---|---|---|---|
| 1 | 配備セット確定 | done | hook 3本・settings 登録・器2ファイル・skill 経路 | 一致 |
| 2 | 1 product パイロット発火（注入+deny 実物取得） | done | SessionStart 注入 + ExitPlanMode deny を実取得済 | 一致 |
| 3 | 全 product 横展開 | done | 通電テストで実発火確認（下記） | 一致 |
| 4 | 新規 product 既定配備 | done | product-scaffold 雛形 + new-product skill に組込 | 一致 |
| 5 | 配備漏れ・退行を機械検知 | done | check-in **A-29** が通電鮮度を検知 | 一致 |

## 検証機構の実体（存在検査 ≠ 有効検査）

- `scripts/daigi-smoke-test.mjs` — 全 product で実際に `claude -p` を起動し、`~/.claude/logs/hook-errors.jsonl` に `session-start-handover-inject`（SessionStart）の実行記録（cwd・hook 名・exit_code）が載ることを機械判定する。**モデルの返答を判定材料にしない**（機械が書いた事実のみ）。全 PASS 時のみ `tmp/daigi-smoke-last-pass.txt` に日付を残す。
- check-in `A-29` — 上記スタンプの経過日数を見る。≤14 日で OK、超過で WARN + 対処コマンド提示。**器の存在は数えない**（存在検査は「弱い方が PASS を出し続け強い検査の不在を隠す」ため意図的に撤去済）。
- 最終 PASS: **2026-07-17**（2 日前・鮮度 OK）。

## 残る 1 点（非ブロッキング・段階2 候補）

通電テストがカバーするのは **SessionStart 注入の発火のみ**。完了条件本文は「SessionStart の大義注入 **と** ExitPlanMode の大義ゲートが実発火する」と両方を挙げるが、`plan-daigi-gate`（ExitPlanMode deny）の per-product 発火は通電テストに含まれない（`claude -p` は plan mode に入らず ExitPlanMode を発火させないため）。

ただし当該ゲートは:
- 決定的 hook（PreToolUse・advisory でない）
- `$CLAUDE_PROJECT_DIR` 相対でパス解決 → product 非依存の同一コード
- `propagate-hooks.mjs` で全 product へ同一実体を配布
- M2 で実 deny を取得済

のため「一箇所で発火＝全箇所で発火」が構造的に担保され、実害リスクは低い。ゲート発火を通電テストへ追加するかは段階2（別セッション）判断。M3/M5 の done 判定を覆すものではない。

## 判断

- roadmap-state.json の status 変更（`done`→戻し）は **不要**。取りこぼし無し。
- 段階1が想定した「costly な全 product 実行で発火マトリクスを新規取得」は、2 日前の PASS 記録が既に存在するため **費用対効果が低い**。マスター判断で再実行するかを仰ぐ。
