# scripts/ 残余 10 件 仕分け Implementation Plan

> **引き継ぎ注記（別セッション AI 向け）:** この plan は Session 302（工程 2-2 補修）で「後回し」と判定された scripts/ 残余 10 件の処置手順。Session 302 では product 固有 4 件（build-coach.mjs → coach / client 3 件 → aiueo）のみ返却済（commit vibe-governance `90105be` / vibe-base `fed6d7a`）。本 plan の 10 件は **工程 2-3（参照書換）のブロッカーではない**（products/ から参照されていないため）。工程 2-3 / 2-4 と独立に、任意のタイミングで実行してよい。

**Goal:** `vibe-governance/scripts/` 配下の skill 付随 8 件 + monetization 灰色 2 件を、それぞれ正しい所在（skill 物理正本 / monetization 領域 / governance 据え置きのいずれか）に確定配置し、参照元（skill SKILL.md / governance docs）から解決可能な状態にする。`check-residual-refs`（手動 grep）で旧パス参照ゼロ。

**Architecture:**
各群ごとに「参照元の精査 → 戻し先確定 → 移動（cross-repo の場合は rm + add の 2 repo commit）→ 参照書換」の 4 段。skill 付随は user-level skill repo（`rahiseko-alt/claude-skills-base` = `~/.claude/skills/`）への移動可能性があるため、移動前に各 SKILL.md の参照形式（絶対パス / skill 相対 / `_shared/resolve-paths` 経由）を必ず確認する。

**Tech Stack:** git（複数 repo・skill repo は独立 git）/ PowerShell / ripgrep

---

## File Structure

| パス | 種別 | 責務 |
|---|---|---|
| `vibe-governance/scripts/replicate-generate/generate.py` | 移動 or 据置 | Replicate API 画像生成 CLI（create-image skill 専属） |
| `vibe-governance/scripts/replicate-generate/compose_thumbnail.py` | 移動 or 据置 | Replicate 出力サムネイル合成（同上） |
| `vibe-governance/scripts/style-extractor/extract-keyframes.py` | 移動 or 据置 | CSS @keyframes 抽出 |
| `vibe-governance/scripts/style-extractor/interaction-diff.js` | 移動 or 据置 | インタラクション style 差分 |
| `vibe-governance/scripts/style-extractor/library-detect.js` | 移動 or 据置 | GSAP/Swiper/AOS 検出 |
| `vibe-governance/scripts/style-extractor/motion-tools.js` | 移動 or 据置 | アニメーション計測 |
| `vibe-governance/scripts/style-extractor/transition-scanner.js` | 移動 or 据置 | CSS transition スキャナ |
| `vibe-governance/scripts/style-extractor/README.md` | 移動 or 据置 | style-extractor 説明書 |
| `vibe-governance/scripts/abc-analysis/build_cat10_16_11.py` | 移動 or 据置 | ABC 分析カテゴリ 10-16-11 集計 |
| `vibe-governance/scripts/abc-analysis/build_cat772.py` | 移動 or 据置 | ABC 分析カテゴリ 772 集計 |

**据え置き確定（本 plan 対象外・参考）:** `scripts/abc-analysis/build_template.py`・`scripts/monetization/build.py`・`scripts/monetization/sync.py` は Session 302 Explore 調査で「governance 共通資産」判定 = vibe-governance に残す。

---

## 役割分担表（必須・空欄禁止）

| エージェント | 担当タスク | 受領基準 | 報告先 |
|---|---|---|---|
| 司令塔（cwd=vibe-governance / 必要に応じ skill repo へ cd） | Task 1-3（精査 + 移動） | 各群の戻し先がマスター承認・移動後 grep で参照解決 | マスター |
| 司令塔（cwd 両 repo） | Task 4（参照書換 + 検証 + commit） | 旧パス参照ゼロ・各 repo commit 済 | マスター |
| subagent（Explore） | Task 1-3 の参照元精査（任意・context 保護目的） | 参照形式の報告 | 司令塔 |
| プロダクト agent | 未使用（本工程は司令塔単独） | — | — |

---

## Task 1: replicate-generate/* (2 件) の戻し先確定 + 移動

**Files:**
- Read: `C:/Users/user/.claude/skills/create-image/SKILL.md`
- Read: `C:/Users/user/.claude/skills/create-image/replicate-playbook.md`
- Modify or Move: `vibe-governance/scripts/replicate-generate/{generate.py,compose_thumbnail.py}`

- [ ] **Step 1: 参照形式の精査**
- create-image SKILL.md + replicate-playbook.md を Read し、`replicate-generate/generate.py` をどう呼んでいるか確認:
  - パターン A: `node ~/.claude/skills/create-image/...` のような skill 相対 → skill 同梱が正
  - パターン B: `vibe-governance/scripts/replicate-generate/...` 絶対参照 → governance 据え置きが正
  - パターン C: `_shared/resolve-paths.mjs` 経由 → resolver の解決先に追従
- 受入条件: 上記 A/B/C のどれか確定。判定不能ならマスターに報告して指示を仰ぐ

- [ ] **Step 2: 戻し先確定 + 移動**
- A の場合: `~/.claude/skills/create-image/scripts/replicate-generate/` に移動。skill repo（`rahiseko-alt/claude-skills-base`）は独立 git のため、`cd ~/.claude/skills && git add ... && git commit` + `vibe-governance` 側 `git rm ... && git commit`
- B の場合: vibe-governance/scripts/ に据え置き（移動なし）。本 Task は「据え置き確定」で完了
- C の場合: resolver の出力先に合わせる

- [ ] **Step 3: 検証コマンド実行**
```powershell
# 移動した場合: 旧パスに残骸がないこと
Test-Path C:/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/replicate-generate
# 期待: A で移動済なら False / B 据置なら True
```

- [ ] **Step 4: コミット**
```bash
# A の場合（例）
# 注意: git -C ~/.claude/skills で既に skill repo ルートに居るため add path は repo ルート相対
git -C ~/.claude/skills add create-image/scripts/replicate-generate/
git -C ~/.claude/skills commit -m "chore(create-image): receive replicate-generate scripts from vibe-governance"
git -C C:/Users/user/Desktop/ClaudeCode/vibe-governance rm -r scripts/replicate-generate
git -C C:/Users/user/Desktop/ClaudeCode/vibe-governance commit -m "chore(scripts): move replicate-generate to create-image skill"
```

---

## Task 2: style-extractor/* (6 件) の戻し先確定 + 移動

**Files:**
- Read: `vibe-governance/docs/ops/antigravity-tools-reference.md`
- Read: `C:/Users/user/.claude/skills/perfect-web-clone/SKILL.md`（存在する場合）
- Read: `C:/Users/user/.claude/skills/reference-site-measure/SKILL.md`（存在する場合）
- Modify or Move: `vibe-governance/scripts/style-extractor/*`（6 件）

- [ ] **Step 1: 参照形式の精査**
- Session 302 調査では style-extractor は **skill から直接参照されず、governance docs（antigravity-tools-reference.md）が言及**していた
- antigravity-tools-reference.md を Read し、style-extractor をどう位置づけているか確認
- ui-clone / reference-site-measure / perfect-web-clone の SKILL.md を Grep で `style-extractor` 検索し、参照の有無を確認
- 受入条件: 「governance 汎用ツールとして据え置き」か「特定 skill 同梱」かを確定

- [ ] **Step 2: 戻し先確定 + 移動**
- skill 専属参照が判明 → 該当 skill 配下に移動（Task 1 と同じ cross-repo 手順）
- 汎用ツールと確定 → vibe-governance/scripts/ に据え置き（移動なし・本 Task は確定で完了）

- [ ] **Step 3: 検証コマンド実行**
```powershell
Test-Path C:/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/style-extractor
```
期待: 移動なら False / 据置なら True

- [ ] **Step 4: コミット**
```bash
# 移動した場合のみ。据え置き確定なら commit 不要（この plan の完了記録は Task 4 で）
```

---

## Task 3: abc-analysis/build_cat*.py (2 件・灰色) の戻し先確定 + 移動

**Files:**
- Read: `vibe-governance/scripts/abc-analysis/build_cat10_16_11.py`（先頭コメント確認）
- Read: `vibe-governance/scripts/abc-analysis/build_cat772.py`（同上）
- 確認: `monetization.xlsx` の現在の所在（Session 302 時点では `vibe-base/monetization.xlsx`）

- [ ] **Step 1: monetization.xlsx の所在確認 + 依存精査**
- `Get-ChildItem C:/Users/user/Desktop/ClaudeCode -Recurse -Filter monetization.xlsx` で xlsx の現在地を確認
- build_cat*.py の先頭コメントで「どの xlsx・どのシートを入出力するか」を確認
- 受入条件: build_cat*.py が monetization.xlsx のどの領域に属すか確定。`build_template.py` / `monetization/build.py` は据え置き済（governance 判定）なので、build_cat*.py だけ別扱いが妥当か判断

- [ ] **Step 2: 戻し先確定 + 移動**
- マスター判断ポイント: build_cat*.py は (a) vibe-governance/scripts/abc-analysis/ に据え置き（build_template.py と同居）/ (b) monetization.xlsx と同じ場所（vibe-base）/ (c) 別の財務管理領域 — のどれか
- Session 302 司令塔の推奨: **(a) 据え置き**（build_template.py が既に governance 判定で同居しており、abc-analysis/ ディレクトリを分割するメリットが薄い。monetization.xlsx 自体の所在が将来変わる可能性は monetization/build.py・sync.py と共通の課題で、abc-analysis/ だけ別扱いする理由がない）
- マスターが (a) を承認 → 移動なし・据え置き確定で完了

- [ ] **Step 3: 検証コマンド実行**
```powershell
Test-Path C:/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/abc-analysis/build_cat10_16_11.py
Test-Path C:/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/abc-analysis/build_cat772.py
```
期待: 据え置きなら両 True

- [ ] **Step 4: コミット**
```bash
# 据え置き確定なら commit 不要
```

---

## Task 4: 参照書換 + 全体検証 + plan 完了記録

**Files:**
- Modify: 移動が発生した群の参照元（SKILL.md / docs）
- Modify: `vibe-governance/memory.md`（P1 から本 plan の索引を消去 or 完了マーク）

- [ ] **Step 1: 受入条件確定**
- Task 1-3 で移動が発生した群について、参照元（SKILL.md / governance docs）の旧パスを新パスに書換
- 移動ゼロ（全群据え置き）の場合は本 Task は「memory.md P1 索引消去」のみ

- [ ] **Step 2: 参照書換**
- 各群の Step 1 で特定した参照元ファイルを Edit で書換

- [ ] **Step 3: 検証コマンド実行**
```powershell
# 移動した群の旧パス文字列が参照元から消えていること
Select-String -Path C:/Users/user/.claude/skills/create-image/SKILL.md -Pattern "vibe-governance/scripts/replicate-generate" -Quiet
```
期待: False（旧パス残存なし）

- [ ] **Step 4: コミット**
```bash
git -C C:/Users/user/Desktop/ClaudeCode/vibe-governance add memory.md
git -C C:/Users/user/Desktop/ClaudeCode/vibe-governance commit -m "chore(scripts): complete residual scripts sorting (10 files) — plan 2026-05-20-scripts-residual-sorting"
```

---

## Risk & Rollback

| リスク | 検知方法 | ロールバック手順 |
|---|---|---|
| skill repo（独立 git）への commit が vibe-governance commit と非同期 | `git -C ~/.claude/skills log` と `git -C vibe-governance log` の時刻照合 | 片方のみ commit 済なら他方を追って commit。skill repo は `git revert` で単独復元可 |
| style-extractor を skill 同梱したが実は別 skill も使っていた | 移動後に該当 skill 実行で path エラー | 全 ui-clone 系 SKILL.md を grep し直し・複数参照なら vibe-governance 据え置きに戻す |
| build_cat*.py を移動したら monetization/build.py との相対参照が切れる | build_cat*.py 実行時の import / path エラー | 据え置き推奨（Step 2）に従えば発生しない |
| 「移動 or 据置」判定をせず惰性で全件移動 | この plan の各 Task Step 1 を飛ばした場合 | Step 1 精査は必須・飛ばし厳禁。判定不能はマスター報告 |

---

## Self-Review Checklist

- [x] **Spec coverage:** Goal（skill 付随 8 + 灰色 2 の確定配置）に Task 1-4 が対応
- [x] **No Placeholders:** 「移動 or 据置」は精査結果による分岐であり placeholder ではない（各 Task Step 1 で確定する設計）
- [x] **Type consistency:** replicate-generate / style-extractor / abc-analysis / 据え置き / cross-repo の用語が一貫
- [x] **Glob 実体照合:** 移動元 10 ファイルは Session 302 時点で vibe-governance/scripts/ 配下に実在確認済
- [x] **役割分担表:** 空欄ゼロ
- [x] **Verification Commands:** 各 Task に Test-Path / Select-String の exact command

---

## 必須 10 要素チェック

1. ✅ Goal: skill 付随 8 + 灰色 2 の確定配置 + 参照解決
2. ✅ Architecture: 群ごと「精査 → 確定 → 移動 → 参照書換」4 段
3. ✅ Tech Stack: git（複数 repo）/ PowerShell / ripgrep
4. ✅ File Structure: 10 ファイル一覧 + 据え置き確定 3 件の参考記載
5. ✅ Task Decomposition: Task 1-4 各独立
6. ✅ Bite-Sized Steps: 各 Step 2-5 分
7. ✅ Complete Code Blocks: git / PowerShell コマンド全文
8. ✅ Verification Commands: 各 Task に exact command
9. ✅ No Placeholders: 分岐は精査確定設計
10. ✅ Self-Review Checklist: 上記

## 背景（Session 302 の判断経緯）

工程 2-2（filter-repo 移転）で `vibe-base/scripts/` を丸ごと `vibe-governance/scripts/` に移したが、scripts/ には governance 検証 script と product 固有 / skill 付随 script が混在していた。Session 302 で 34 ファイルを仕分け（Explore subagent 精査）:
- governance 20 件 → 据え置き
- product 固有 4 件 → Session 302 で返却済（build-coach.mjs → coach / client 3 件 → aiueo）
- skill 付随 8 件 + 灰色 2 件 → **本 plan で処置**（戻し先が skill repo か別領域か曖昧なため後回し）

マスター指示（Session 302）: 「後回しにする 10 件は具体的に手順を決めて、別セッションの AI が確実に読めるようにしろ」→ 本 plan として永続化。memory.md P1 に索引を張り Check-in で確実に拾われるようにする。
