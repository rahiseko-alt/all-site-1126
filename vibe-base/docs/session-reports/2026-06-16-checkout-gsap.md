# Check-out 引継ぎ — GSAP 公式知識の user-level スキル化

- branch: `master` / HEAD: `bb61b8f0`（vibe-base）／ claude-skills-base HEAD: `64f78c5`
- **次セッションは本ファイルを先頭から Read してから着手すること。**

## 🔴 最重要

1. **GSAP 知識の正本は `~/.claude/skills/gsap/` に一本化された**（claude-skills-base repo・別 git）。vibe-base 内 `docs/skills/gsap/` は撤去済み。今後 GSAP 知識を編集する時は **vibe-base ではなく claude-skills-base 側を触る**。
2. 両 repo とも **commit のみ・push 未実行**（司令塔は push deny）。claude-skills-base の push が要る場合はマスター/対話認証経由。

## A. 本セッション TL;DR

- GSAP 公式ベストプラクティス知識（8トピック・722行）を Claude Code user-level スキルとして再導入（A-1 全 product 到達 ＋ B-1 統合1スキル）。
- 統合スキル `~/.claude/skills/gsap/` 構築：SKILL.md（索引＋常時重要事実）＋8トピック.md。progressive disclosure（発火時のみ本体ロード・常時コストは description 行のみ）。
- stale-knowledge 地雷を SKILL.md 冒頭に常時掲示：全プラグイン無料／auth token 不要／v3 構文のみ／TweenMax・ThrowProps 禁止。
- vibe-base の重複 `docs/skills/gsap/` を git rm（`backups/skills-gsap-20260616/` へ退避・gitignore 対象で復元可）。
- value 是正：`docs/html-toranomaki/add-to-cart/concept.md` L10 の「MorphSVG=Club GreenSock トライアル版」誤認を「Webflow 買収以降は全プラグイン無料・auth token 不要」へ修正。
- 受け入れ基準 1-6 を自検証＋verify-agent 独立検証で全 PASS。

## B. 完了 commit 一覧

| repo | hash | 種別 | 内容 |
|------|------|------|------|
| claude-skills-base | `64f78c5` | feat | gsap/ 9ファイル新規（SKILL.md＋8トピック・744行） |
| vibe-base | `bb61b8f0` | refactor | docs/skills/gsap 撤去9件＋add-to-cart concept.md 是正（path限定） |

## C. 影響波及

- 全 product のエージェントが GSAP 記述・推奨時にスキル `gsap` を自動参照可能になった（cwd 非依存）。homepage（ScrollTrigger/Flip/drum/qr-flip）・portfolio・虎の巻9テーマ（add-to-cart=MorphSVG, draggable-liquid=Inertia 等）が裨益。

## D. 残作業

- **L**: GSAP 知識の定期更新 — upstream `greensock/gsap-skills` の差分取込（陳腐化対策）。
- **L**: add-to-cart impl のローカル `MorphSVGPlugin3.min.js` を npm package 化（任意）。

## E. 配備済 subagent / skill / hook

- skill 追加: `gsap`（user-level・C群・project-agnostic）。registry 1枠・常時 ~50トークン。

## F. 本セッション生成レポート

- 本ファイルのみ（tmp/ への中間生成なし）。

## G. 次セッション初手

1. 本レポートを Read。
2. GSAP 関連作業が発生したら正本 `~/.claude/skills/gsap/`（claude-skills-base repo）を編集（vibe-base ではない）。
3. 機械検証サマリ（Wave A-2）：シークレット混入 0 件 / check-skills-spec EXIT 0。
4. コードレビュー指摘（Wave A-3）：0 件（no issues）。
