# vibe-base 内部監査 — 公式/GitHub 最新ベンチマーク採点（2026-06-17）

> ベンチマーク = Claude Code 公式 docs（code.claude.com・2026-06 時点）+ Anthropic Engineering + GitHub 確立パターン（awesome-claude-code 系）。
> 監査手法 = Explore による実体監査 + research-analyst による公式 BP 抽出 + 司令塔の実体照合（行数/exit code/フラグ）。

## 総合スコア

| 問い | スコア | 一言 |
|------|--------|------|
| 1. ノウハウ蓄積レベル | **8 / 10** | 設計知識は公式フロンティアにほぼ並走。最新機能の取込だけ遅れ |
| 2. 運用適正度 | **7 / 10** | 設計は強いが「書いた ≠ 効いている」の実効ギャップが減点 |
| 総合（公式最新比） | **7.5 / 10** | 中上位。上位互換は最新機能の機械強制化で取りに行ける |

## 8 軸スコアカード（各 /10）

| 軸 | 公式の満点像 | vibe-base 現状 | 点 |
|----|-------------|---------------|----|
| CLAUDE.md/メモリ | 200行以下・手順はskillへ・@import・per-directory分割 | 司令塔CLAUDE.md 53行・per-dir 23件・pointer/canonical分離・@import運用 | 9 |
| hooks 決定論的強制 | exit2でブロック・静的はCLAUDE.md・独立設計・故障検知 | hook15本+hook-runner5検査軸。但しブロックは settings権限/分類器依存が主・hook故障隠蔽検知が未自動化 | 7 |
| subagents 設計 | 単一責務・明確description・tools絞り・isolation:worktree | explore/implement/verify三層・tools絞込・user-level正本 | 8 |
| permissions 階層 | deny>ask>allow・5層・auto mode・bypassはVM限定 | 3段実装・deny=unrecoverable限定・auto mode稼働（分類器が実際にdeny発火確認済） | 9 |
| plan mode/検証 | Explore→Plan→Implement→Commit・Stop hook gate・adversarial subagent | plan-mode C設計canonical 345行・verify-agent（評価者分離）・check-in-verify | 7 |
| skills 設計 | description先頭keyword・副作用はdisable-model-invocation・dynamic injection・context:fork | 30+skill・frontmatter検証(check-skills-spec)。但しdisable-model-invocationは1件のみ・最新機能未活用 | 6 |
| マルチエージェント | subagents第一選択・1agent=1file・spawn時context明示・TeammateIdle hook | formation規律+動的再配分規律あり。agent teams/TeammateIdle hook未活用（実験的のため妥当） | 6 |
| アンチパターン回避 | 8大アンチパターン非該当 | CLAUDE.md簡潔・verify分離・explore隔離・permission併用。exit1誤用1件のみ（軽微） | 8 |

平均 = 7.5 / 10。

## 強み（公式に並走している点）

1. **CLAUDE.md 簡潔さ** — 53行（公式上限200行を大きく下回る）。pointer/canonical分離＋@importは公式の large-codebases ガイドと同型。
2. **permissions 3段＋auto mode** — deny>ask>allow が正しく実装され、auto mode 分類器が実際に破壊的操作を deny 発火（本セッションで実証）。公式の最新到達点に一致。
3. **検証者分離** — verify-agent が実装者と別 context で受入基準を機械判定。公式「adversarial subagent」と同思想。
4. **per-directory ガバナンス** — 23 product 全に自治憲法＋memory.md。モノレポ分割の公式推奨を満たす。

## 弱点（実効ギャップ＝運用適正度の減点要因）

1. **failures 97件のうち機械検証昇格は約15%** — 残85%は「メモ/SOP文書化」止まり。憲法 §5「AI自己規律禁止・全て機械検証で実装」と乖離。教訓の実効が AI の読取能力に依存。
2. **hook 故障隠蔽の検知が未自動化** — `hook-errors.jsonl` の定期 grep は failures にメモのみ。cron/scheduled なし（kosespark で secret-gate が ERR_MODULE_NOT_FOUND 無効化の前例）。
3. **gate が人間判定** — product-cycle P0→P4 移行・verify-agent 呼出が「マスター指示/orchestrator明示」依存。公式の Stop hook completion gate 未導入。スケール時のボトルネック。
4. **skills 最新機能の取りこぼし** — disable-model-invocation（副作用ある操作の手動専用化）が1件のみ。deploy/checkout系こそ手動専用化すべき。dynamic injection（`!cmd`）・context:fork も未活用。

## 公式比で「まだ追いついていない」最新機能

| 機能 | 公式の位置づけ | vibe-base |
|------|---------------|-----------|
| Stop hook で completion をゲート | ターン終了を機械ブロック | 未導入（verify-agentは人手呼出） |
| disable-model-invocation | 副作用操作の手動専用化 | 1件のみ |
| agent teams + TeammateIdle hook | ピア協調＋idle時品質ゲート | 未活用（実験的のため保留は妥当） |
| context:fork（skill） | main context汚染回避 | 未活用 |

## 投資優先度（公式基準に寄せる順）

1. **failures→機械検証の昇格選別** — 「script化対象/メモで十分」をfailures索引にmark化。85%放置を是正。
2. **hook故障検知の自動化** — `hook-errors.jsonl` 定期grepをSessionStart hookかscheduled化。
3. **completion gate の機械化** — 完遂commit前の verify-agent 呼出をStop hookで強制（憲法 orchestration-discipline 規律3を機械化）。
4. **副作用skillの手動専用化** — vercel-deploy/checkout 等に disable-model-invocation 付与。

## 出典（ベンチマーク一次ソース）

- code.claude.com/docs: memory / hooks / sub-agents / skills / settings / permission-modes / best-practices / agent-teams / large-codebases
- anthropic.com/engineering: claude-code-auto-mode / building-effective-agents
- github.com: awesome-claude-code（hesreallyhim）/ awesome-claude-code-toolkit（rohitg00）
