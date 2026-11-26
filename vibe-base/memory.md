# vibe-base 製品横断 memory.md

> vibe-base モノレポ司令塔 memory.md (旧 vibe-governance/memory.md は archive/governance-memory-2026-05-26.md に退避)

## H2大義 ＋ ロードマップ（最上位・毎セッション必読）

> 正本: `roadmap.md`（H2大義＋マイルストーン）／ `roadmap-state.json`（現在地・status のみ編集可）／ `backlog.json`（後回し・**マイルストーン完走判定時のみ**読む）
> 序列: **H1大義 ＞ H2大義 ＞ プラン ＞ アクション**（正本 `CLAUDE.md` §0）。上流から順に「満たすか」を照合し、1つでも満たさなければ却下。下流は上流を遡るな。
> **H2大義が空ならセッションを進めるな**（空＝判定機構の停止＝前回の慣性で動き出す）。H2大義はマスターが判定する。**AI が立てるな・推測で埋めるな。**
> 🔴 **[2026-07-19] 新 H2大義をマスター確定＝「PC が起動していれば、スマホから web-platform を開発できる」（Remote Control 経由・種別:完了）。マイルストーン1〜3 すべて todo・未着手。正本 roadmap.md / roadmap-state.json。旧大義（daigi全product配備＝完了）は git 履歴に残る。**

## 引継ぎレポート (次セッション必読)

> **着手前に、触る product の最新レポート（下表「詳細」列）を必ず Read せよ。**
> memory.md は cross-product の索引。full detail は各レポートに置き、ここは 1 セッション 1 行だけ（narrative を詰め込むな）。

@docs/session-reports/2026-08-03-checkout.md

> 07-23〜07-12 の完遂済みエントリは `archive/vibe-base-memory-202507.md` へ退避済（byte上限維持）。

| 日付 | product | 要点（詳細はレポート必読） | 詳細レポート（docs/session-reports/） |
|---|---|---|---|
| 08-03 | video-report/video-lecture-package(skill) | SHIFT AI「Claude Code入門」全9本をvideo-reportでレポート化完了。vibe-base本体+skills repo双方の持ち越し差分を一括commit・push。teaching-slide-packageを統合する新規skill`video-lecture-package`を作成。スライド生成のRemotion代替案は目標クオリティ未達で撤回・既存画像生成AI方式を維持 | `2026-08-03-checkout.md`（＝上の@参照） |
| 07-27 | homepage | kouheikosehira.com 全面刷新（旧AI_OFFICER→法人向けAI導入支援・HP0727.html忠実再現）。**内部文書127件が本番公開の既存問題を検出→`.vercelignore`是正で404化**。写真03〜10に解釈ズレ残存 | `2026-07-27-checkout.md` |
| 07-26 | ai-concierge / foodee | ai-concierge既知課題#1(CORS是正)が完全解決（Supabase復帰→migration適用→本番デプロイ→実チャット確認）。foodeeはVercel誤配線（無関係リポジトリx-auto-postへのGit連携+誤Root Directory＝ai-concierge#14と同型）を復旧、`https://foodee.kouheikosehira.com`稼働確認。次回はfoodee改修に着手予定 | `2026-07-26-checkout.md` |
| 07-25 | ai-company | マスター指示で**自動稼働停止**。無人自走4タスク（secretary/dashboard-data/board-meeting/funding-research）を `Disable-ScheduledTask` で無効化（可逆・登録は保持・再開は`Enable`）。前回07-23のcommit漏れも本commitで回収 | `2026-07-25-checkout.md` |
> 🔴 **x-auto-post 未解決の地雷（詳細は 2026-07-11-x-auto-post-refill-redesign.md）:**
> 1. `studio/tests/` を repo ルートで走らせると本番 `last-run.json`/`thread-state.json` を汚染。使い捨てクローンで走らせよ。
> 2. **`.claude/settings.json`（x-repo自身）の広域deny `"Bash(git push:*)"` が補充routineのpushを一律拒否している。** マスター判断待ち（`--force`/`-f`のみへ絞る／別方式／補充無人化を一旦保留、の3択）。決まるまでStep7・8（plan `iridescent-honking-squid.md`）は着手不可。
> （旧item1「append_analysis_posts.py unknown化」・旧item3「日付ベース草稿の重複残骸」は 07-10/07-11 でそれぞれ解消済み）

## P1: 引継ぎミッション（3 件枠）

> 直近 plan: ~/.claude/plans/functional-inventing-sifakis.md（Serena 提案 hook・完了 commit 28d214212）／serialized-puzzling-pine.md（ai-company-ops 会社化・司令塔分の Phase A は A-2 まで完了）
> **git は path-scoped 必須**（`git add -A|.`・`git commit -a` は hook `pre-git-staging-gate` で機械block・全product propagate済）。詳細 → archive/vibe-base-memory-202506.md
> 完了済[2026-06-26]: x-auto-post BEARER実read稼働 + Obsidian vault連携。schtasks `x-vault-sync`(08:00)/`x-vault-sync-verify`(08:15) は **repo外OS資産=PC初期化時再登録要**。
> **x-auto-post の正**[2026-07-09 更新]: 独立リポ = GitHub `rahiseko-alt/x-auto-post`（本番）。旧ローカル `ClaudeCode\x-auto-post-repo` は 7/9 復旧作業で**削除済**。作業クローンは `~/.claude/tmp-x-recovery/` 配下（push は毎回クリーンクローンから path-scoped）。secrets/cron は GitHub 側在住で無傷。x-vault-sync.mjs は cross-repo 対応済（x系 target は x-repo の origin/master を読む）。

0. [importance:H][2026-08-03] video-lecture-packageスキル（動画URL→①教材スライド一式②講師台本）の実行と品質確認。**マスター指示・次回最優先**。teaching-slide-package Step8の画像生成がcreate-image経由で正しく動くか、実物で確認すること — plan: なし
1. [importance:H][2026-07-19] CC-v2（remote-native/repo-is-truth クリーンルーム・別org）構築。計画=`~/.claude/CC-v2-plan.md`（自己完結・§3に全scaffold中身）。`C:\Users\user\CC-v2`はgit init済/空/未push。素端末or別セッションでscaffold（vibe-baseはoutside-gate不可）→別org private repo→remote add→push — plan: ~/.claude/CC-v2-plan.md
2. [importance:H][2026-07-23] IGタイミング逆転を根治（画像生成を前日17:30 UTCへ前倒し・基準1〜3 PASS）。残: 07-24無人routineで基準4検証／旧Bufferキー`kosehira-cli`のRevoke確認／Step10 Buffer画面目視 — plan: ~/.claude/plans/binary-finding-spindle.md
> [importance:H][2026-07-11] x-auto-post 補充無人化 plan の Step1-6 完了・push済（x-repo f16d1076）。Step7でx-repo自身の`.claude/settings.json`広域deny`git push:*`によりブロック中・マスター判断待ち（3択は引継ぎMD参照）・期限超過 — plan: ~/.claude/plans/iridescent-honking-squid.md
> 高優先[2026-07-27] homepage: 写真03〜10が旧解釈のまま要再点検／H2大義がAI起案のまま未承認。**`products/homepage` にファイル追加時は必ず `.vercelignore` 見直し（記載漏れ=全世界公開）**。foodee改修は未着手 — plan: なし
> 中優先[2026-07-27] ブランチ整理: `busy-raman-e0cab5` 削除がマスター手動待ち（`-D` 必須で権限ガード・中身はmasterとバイト一致でマージ不要と判定・origin `25b4457` に復旧経路）。master は origin/master より10commit先行（push は deny）— plan: なし
> 中優先[2026-07-26] review-analysis本体アプリが同型デプロイ障害の疑い。対処要否をマスターに確認 — plan: なし
> 🔴 **「危険」の判定基準は Claude Code 公式定義が一次基準**（2026-07-10 マスター裁定・正本 `docs/rules/permission-defense-canonical.md`「『危険』の判定基準」節）。AIの主観で危険度を広げるな。公式は `bash`/`node`/`npm`/`ssh`/`start`/`schtasks`/`wmic`/`export PATH` を危険と定義せず、`cp`/`mv` は安全側に分類している。**checkout-4.md の 🔴（bash/find の blocking FAIL・CRLF偽陽性）は全て解決済。復活させるな** → `docs/session-reports/2026-07-10-checkout-5.md`
> 🔴 **起票のみ・修正するな**: `pre-bash-destructive.mjs` の matcher が `^` アンカーで `bash -c`/`env` 前置で全て未検知（S-5 が変更禁止と明記）・git deny の前方一致バイパス（hook で対応可能だが未実装）・audit-local-allow の検知漏れ（python3.11/多段パイプ 等）。8本目起票か③合流かマスター判断待ち
> 🔴 監査2026-07 **7プラン系オールクリア確定**（2026-07-13-2）: 7本全完了 + 「実行中に発見した問題」29件を修正/認定しない/放置で全件決着（未対応ゼロ）。#1/#2/#4/#5系=master「認定しない」確定＝**再提案禁止**。次session=残は別トラックH（databank実削除/認証穴・x-auto-post Step7）のみ
> 凍結済[2026-07-13] hp-customizer は事業方針転換により凍結（archive/hp-customizer/ へ退避）。後継 products/web-platform で「ページ構成×デザインシステム×セクション部品」の組合せ生成基盤として再設計中
> 中優先[2026-07-11] ai-company（P0新規・単一HTML型・独立リポ）＝会社化構想 Phase D「我が社ダッシュボード」実装。§1最重要ルール・§3デザイン・即死仮説（hypotheses.md は draft）はマスター確認待ち — plan: ~/.claude/plans/serialized-puzzling-pine.md
> 待機[2026-06-16] spire-lite / kosespark P0 立ち上げ（両者マスター情報待ち＝§1等確定まで着手不可）— plan: なし
> 中優先[2026-07-03] medguide-rag（外部ポートフォリオ・医療文書RAG+評価ループ）Stage1〜4実装 — plan: ~/.claude/plans/abundant-spinning-gray.md（当初計画原文は products/medguide-rag/docs/original-plan.md・改変禁止）
> 低優先[2026-06-27] Serena: 採用率0.14%実測＝便益未発生。**再測定 2026-07-04**（`node outputs/serena-usage-analyze.mjs`） — plan: なし
> 低優先[2026-06-25] Hallmark スキルインストール済（`vibe-base/.agents/skills/hallmark/` v1.1.0）。**google-slides-gen 限定で様子見** — plan: なし
> 低優先[2026-06-24] デザイン品質底上げ 残タスク — plan: ~/.claude/plans/peaceful-snuggling-pike.md 末尾「残タスク」節

## P2: ADR 索引

- [2026-05-23] `docs/adr/0001-plan-mode-c-design.md` — A・B 抹消と C 採用の決定経緯
- [2026-06-06] `docs/adr/0002-memory-role-separation.md` — MEMORY.md と vibe-base/memory.md のデュアル構造維持
- [2026-06-21] `docs/adr/0003-worktree-feature-branch-migration.md` — worktree 段階移行・統合は本体経由 merge→push（PR 経由禁止＝分岐根治）
- [2026-07-16] `docs/adr/0004-default-web-saas-stack.md` — Web/SaaS型productのデフォルトスタック確定（Next.js+TS+Postgres(Supabase)+Vercel+Prisma、AI/ML比重高いものはPython+FastAPI可。ゲーム/動画/GUI自動化は都度決定）

## P3: 失敗事例

→ `failures.md` 参照

## P4: 永続教訓

→ `archive/vibe-base-memory-202506.md` 参照
