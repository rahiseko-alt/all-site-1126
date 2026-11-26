# 2026-07-04 Check-out — A-2 真因修正 / Serena 効果測定＋提案 hook 有効化 / 巻き添え kill 事故

> **次セッションは本ファイルを先頭から Read してから着手すること。**
> branch: master / 本セッションは vibe-base 司令塔（root）

---

## 🔴 最重要

1. **巻き添え kill 事故を起こした**: A-2 テストのハング診断中、稼働中の claude.exe 3件を「headless 残骸」と誤断定して kill し、**マスターの対話セッション3つを全滅**させた。しかも誤情報で kill 承認を取った。→ failures.md に記録済（2026-07-04 エントリ）。**再発防止確定: 並行セッション環境で claude.exe/node をプロセス名・PID 一致で kill 禁止**。
2. **Serena 提案 hook を有効化（commit `28d214212`）**: PreToolUse(Read|Edit) で products 配下の TS/JS/Py コード(≥10k)を触る瞬間に「Serena を使うか」を1回だけ AI→マスター提案する機械導線。Live 実発火実証済み・全 product へ propagate 済み。**次に誰かが大物 product コードを Read/Edit した瞬間に提案が出る**。
3. **ai-company-ops A-2 は foreground で完了扱い（マスター判断）**: schtasks 無人発火テストは「もういい」で不実施。会社機能（朝会/日報/タスク消化）の実装は**該当ディレクトリの仕事**＝司令塔は手を出さない。

---

## A. 本セッション TL;DR

1. A-2 真因特定＋修正: `test-shusha.mjs` の `claude -p` が `defaultMode:plan`＋allow欠如で無人ハング → `--permission-mode default`＋git限定`--allowedTools` で解決。**foreground 3連続成功**（commit `821e31884` に同梱）。schtasks 無人発火はマスター判断で不実施。
2. 巻き添え kill 事故（🔴1）→ failures.md 記録＋28KB 上限のため旧[S✓]1件を archive へ退避。
3. Serena 効果を「使った場合のみ」で実測: **コンテクスト省力化 加重平均 88.7%・ピンポイント編集 6/6=100%**。ただし採用率 1.4%（直近5日不使用）＝**効果は高いが使われていない**。最大需要（root/scripts 2.1M字）は root activate 禁止で射程外。
4. 対策として Serena 提案 hook を実装・検証・配布・commit（🔴2）。擬似 stdin 9分岐 PASS＋Live 実発火＋検証パネル②③ advisory 修正済（containment/sanitize/NaN）。
5. A-0/A-1（demo-company 廃番・ai-company-ops scaffold）を path-scoped で確定 commit。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `dc188562c` | chore(ops) | demo-company 廃番登録（registry＋memory 廃止記録・A-0） |
| `821e31884` | feat(ai-company-ops) | Phase A-1 scaffold ＋ A-2 無人起動便 真因修正（A-1/A-2） |
| `28d214212` | feat(hooks) | Serena 提案 hook 追加＋全 product 配布（欠落 hook 治癒含む） |
| （本 checkout） | chore(memory) | failures.md 記録＋archive＋memory.md P1/@ 更新 |

## C. 影響波及

- Serena 提案 hook は **root＋全 product の `.claude/settings.json` に登録済み**（propagate 実行）。matcher `Read|Edit`＝全 Read で hook spawn（非該当は即 exit 0・marker で発火後は黙る）。閾値は env `SERENA_SUGGEST_MIN_BYTES`（既定 10000 byte）で可変。
- propagate が既存 hook 欠落を **73ファイル治癒**（副作用・commit `28d214212` に含む）。
- Serena 効果測定スクリプト3本を `outputs/`（gitignore・ローカル）に作成: `serena-effectiveness.mjs`／`serena-missed-opportunities.mjs`／既存 `serena-usage-analyze.mjs`。再測定は各 `node outputs/<name>` で可。
- ai-company-ops の会社/attendance へ無人 commit 3件（`a12d1a388`/`f0d68110d`/`39171e569`）＝A-2 foreground 実証の打刻。

## D. 残作業

| 優先度 | 内容 | plan |
|-------|------|------|
| H | モノレポ→製品別ローカル git 分離 Step4-6（他セッション全閉鎖後・未実行） | starry-wiggling-eagle.md |
| H | hp-customizer 編集エンジン層（即死仮説#1） | なし |
| M | ai-company-ops 司令塔担当分＝schtasks 恒久登録(A-6・立会い)＋Phase A ゲート検証パネル(A-8)。会社機能実装は該当 dir | serialized-puzzling-pine.md |
| L | 検証パネル残 advisory 6件＋A-22 hook WARN / atelier / Hallmark 処遇 / product-cycle 番号参照 | jaunty-knitting-panda.md 他 |

## E. 配備済 subagent / skill / hook

- **新規 hook**: `.claude/hooks/serena-suggest-gate.mjs`（PreToolUse Read|Edit・Serena 提案・全 product 配布済）
- subagent/skill の追加なし

## F. 本セッション生成レポート

- 本ファイル（引継ぎ）／`~/.claude/plans/functional-inventing-sifakis.md`（Serena hook 実装 plan・承認済）／`~/.claude/plans/gentle-tinkering-fog.md`（A-0/A-1/A-2 実行 plan）
- `outputs/serena-effectiveness.mjs`・`serena-missed-opportunities.mjs`（効果測定・ローカル）

## G. 次セッション初手

1. 本ファイル Read。
2. Serena 提案 hook が有効稼働中＝大物 product コードを触ると提案が出る（承認したら ToolSearch→activate_project→シンボル操作）。
3. 残作業 D から着手（H 2件が本命）。会社機能は該当 dir・司令塔は oversight のみ。

- 機械検証（Wave A-2）: secret-grep 0件 / hook `node --check` OK / 擬似 stdin 9分岐 PASS
- 検証パネル（Serena hook）: ②③ FAIL(advisory)・blocking 0 → advisory 4件 修正して再検証 PASS
