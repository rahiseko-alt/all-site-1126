## 防御 3 段モデル（Claude Code 公式仕様準拠・Session 283 確立 / a-b-c-3-jazzy-squid plan で過剰削減）

### 評価順序: Deny → Ask → Allow
- **Deny**: fail-safe で最優先・unrecoverable
- **Ask**: 要判断・任意コード実行ゲート
- **Allow**: 自動

### Deny の正規対象（settings.json `permissions.deny`）

**ファイル系**:
- `.env` / `.env.*` / `**/.env` / `**/.env.*` の Edit/Write
- `.git/**` 配下の Edit/Write
- `**/secrets/**` の Write

**git 系**:
- `Bash(git push --force*)` / `Bash(git push -f*)`
- `Bash(git reset --hard*)` / `Bash(git branch -D*)`
- `Bash(git push:*)` / `Bash(git reset:*)` / `Bash(git rebase:*)`

**file destroy 系**:
- `Bash(rm -rf:*)`（hook の補助層・hook では複合コマンド非対応のため最低限の prefix block）

**network 系**:
- `Bash(curl:*)` / `Bash(wget:*)`（GET 含む全 outbound 通信遮断・WebFetch tool 経由に集約）

**package 系**:
- `Bash(npm publish:*)` / `Bash(npm uninstall:*)` / `Bash(yarn add:*)` / `Bash(pip install:*)`

**シェル系**:
- `Bash(env)`（環境変数 dump 防御）
- `PowerShell(Get-Content *)`（任意ファイル読出を Read tool に集約する vibe-base 独自規律・Read tool 誘導意図）

### Ask の正規対象（settings.json `permissions.ask`）

**任意コード実行ゲート**:
- `Bash(node -e *)` / `Bash(node --eval*)` / `Bash(node -p *)` / `Bash(node --input-type=*)`
- `Bash(npm install *)` / `Bash(npx --yes*)`
- `Bash(cmd:*)` / `Bash(cmd.exe *)` / `Bash(powershell:*)` / `Bash(powershell.exe *)` /
  `PowerShell(Remove-Item *)` / `PowerShell(Stop-Process *)`（62e2828 で settings.json には
  実装済だったが本 doc 未記載だった分を追記・doc/impl 乖離を解消）
- `Bash(find:*)`（公式に危険の定義は無い。`find -exec` / `-delete` は `Bash(find *)` allow では
  カバーされず公式が常に確認を出すため、本 ask は二重の網。撤去しても安全性は変わらないが
  コストも確認 1 回のみのため据え置く）
- `Bash(bash:*)`（公式に危険の定義は無いが、`bash -c "<任意文字列>"` は 1 サブコマンドとして扱われ、
  deny の `Bash(rm -rf:*)` 等に前方一致しない。deny を素通りさせる唯一のラッパーのため ask を維持する。
  `Bash(bash -c:*)` の個別 ask は `bash -xc` 等のフラグ順序違いで迂回でき無効
  ＝公式が "fragile" と警告する引数パターンそのもの。丸ごと ask 以外に成立する形が無い）

### 「危険」の判定基準（2026-07-10 マスター裁定・単一正本）

危険かどうかは **Claude Code 公式ドキュメントの "What the classifier blocks by default"**
（`code.claude.com/docs/en/permission-modes.md`）を一次基準とする。AI の主観で危険度を広げるな。

公式が危険と定義するもの: `curl` / `wget`（deny 推奨）、`rm -rf /` `~`（circuit breaker）、
`git reset --hard` / `clean -fd` / `stash drop|clear` / `restore .` / `checkout -- .` /
`remote set-url` / `commit --amend`、`gh repo fork`・他組織への PR/push、
`terraform|pulumi|cdk|terragrunt destroy`、`curl … | bash`、
`Bash(python*)` / package-manager run（`npx` 等）の broad allow。

公式が危険と定義しないもの（**危険扱いするな**）: `bash` / `sh` / `node` / `npm` / `ssh` /
`start` / `schtasks` / `wmic` / `export PATH`。`cp` / `mv` は公式が `acceptEdits` で
自動承認する＝**安全側**に分類されている。

> 経緯: 2026-07-10 に security-reviewer の反証を受け `scripts/audit-local-allow.mjs` の危険定義へ
> ssh / start / schtasks / wmic / reg / netsh / certutil / bitsadmin / del / bash -c / Invoke-* /
> Set-ExecutionPolicy を追加したところ、`where python` `schtasks /query` `npx tsc --noEmit` を
> 危険と誤判定した（過剰反応）。マスター裁定により公式定義へ差し戻した。

**cloud / deploy 系**（a-b-c-3-jazzy-squid plan 段階 B で deny→ask 降格）:
- `Bash(docker:*)` / `Bash(kubectl:*)` / `Bash(terraform:*)` / `Bash(aws:*)` / `Bash(gcloud:*)`
- 個人事業文脈で deploy 需要発生時のオーバーヘッド解消・承認 1 回挟む安全弁あり・`defaultMode: "plan"` 二重防御

### Allow の正規対象（`scripts/_lib/canonical-allow.mjs` が single source）

- **正本**: `scripts/_lib/canonical-allow.mjs`（副作用ゼロの純データモジュール・`root-only-hooks.mjs` と同パターン）。`scripts/propagate-hooks.mjs` が root を含む全 product settings.json へ union 伝播する（既存 allow は剥奪しない・冪等）
- 出典: `docs/audits/ops-improvement-scan-2026-07.md` リスト②（A-1〜A-21）／実装: `~/.claude/plans/temporal-gliding-turing.md`
- **G1（Bash 読取専用・可逆群）**: `sleep` / `head` / `tail` / `test` / `date` / `pwd` / `printf` / `which` / `notepad` / `export PATH=$PATH:`（既存 PATH の literal 前置温存形のみ）に限定。ファイル・プロセス・ネットワークへの書込/削除/送信を一切伴わない「読む・待つ・表示する」コマンドのみ採用。`sed:*` 広範形・`awk:*` は**書かない**（sed -i は不可逆書換・awk は system 関数で任意コード実行ゲート相当のため不採用）
- **G2（WebFetch ドメイン群）**: 自社ドメイン（apex + ワイルドカードの2ルール併記）と feed-check 固定11ドメインの個別列挙。`*.example.com` はapex自体にマッチしない公式仕様のため2ルール必須。`github.io` ワイルドカードは第三者取得可能な名前空間のため不採用
- **G3（条件付き・実機プローブ確定）**: env代入プレフィックス形のマッチング可否は2026-07-10に実機プローブで確定。
  - A-14（`PYTHONUTF8=1 python*`）: 実機プローブは **PASS** したが、`python*`/`python3*` が `-c` 任意コード実行を含む全引数に前方一致し G2 の WebFetch ドメイン制限を迂回する直接ネットワークアクセス経路になると security-reviewer 反証（2026-07-10・blocking）で判明。**不採用**（allow ルールを追加しない）
  - A-20（`VAR=$(node ...) *` 形）: **FAIL**（環境変数代入+コマンド置換の記法は前方一致しない。allow ルールは追加せず、skill 側の呼出記法を変更する代替方針を採る。下記「path-resolver」節参照）
- **不採用確定**: A-9(awk) / A-10(sed -n・`-n -i` 併記の in-place 書換に転用可能と security-reviewer 反証で判明のため見送りへ格下げ) / A-12(for) / A-13(timeout) / A-18(github.io ワイルドカード) — 広範 allow は deny 回避の構造的抜け道になるため
- **A-11 export PATH= の絞込**（security-reviewer 反証・2026-07-10）: 当初案 `Bash(export PATH=*)` は PATH 全置換（`export PATH=/evil/bin`）も前方一致し、同一複合コマンド内の後続の既存 allow コマンド（git/node 等）を偽バイナリに差し替える PATH ハイジャックの土台になると判明（blocking）。既存 `$PATH` を literal 前置で温存する `export PATH=$PATH:*` 限定形に修正して採用（全置換は ask 維持）
- A-21（一回性 Bash 棚卸し）は削除作業でありルール追加ではないため canonical-allow.mjs の対象外。`scripts/audit-local-allow-onetime.mjs` が別途棚卸し表を出力する
- 検証: `node scripts/check-canonical-allow.mjs`（root＋全 product の allow ⊇ CANONICAL_ALLOW を機械照合）

### destructive command は hook で防御（公式推奨パターン）

- `.claude/hooks/pre-bash-destructive.mjs`
- 検知対象: `rm -rf` / `rimraf` / `find -delete` / `dd if=` / `mkfs` / `shred` / `taskkill /F` / `node -e fs.rmSync` / `git clean`
- 単独 prefix match のみ（複合コマンド `;` `&&` `$()` 解析は実装しない・過剰反応回避）
- `git clean`（監査 #3・2026-07-13 追加・検証パネル②③で強化）: deny `Bash(git clean -fd*)` は前方一致固定順のため ①フラグ順序（`-df`）②大文字（`Git clean`・Windows はコマンド解決が大小無視）③git グローバルオプション前置（`git -C <path> clean`）で抜けて `Bash(git:*)` allow に落ちる。hook 側は判定を「`-f` の有無」ではなく「dry-run か否か」で行う（`git config clean.requireForce false` 後は `-f` 無しでも削除されるため -f 依存判定は config 経由でバイパス可＝③指摘）。よって `-n`/`--dry-run` を含まない git clean を全て block（bias-to-safe）。**ただし全 destructive matcher 共通の「単独 prefix マッチの原理限界」は残る（本 hook が新規に持ち込んだ穴ではない・#1 で de-scope 済の族）**: ①複合コマンド・シェル前置（`bash -c`/`env`/`VAR=x`）②フルパス/exe 起動（`git.exe` / `/usr/bin/git`＝`Bash(git:*)` allow に不一致のため ask-default で承認プロンプトが出る＝silent 実行にはならない）③alias 間接参照（`git config alias.c "clean -fd"` → `git c`＝2手の意図的難読化・文字列マッチでは追えない）。「git clean 完全封鎖」ではなく「realistic な単一 git clean コマンドの封鎖」と理解せよ
- 承認マーカー: `.allow-destructive`（10 分 TTL）で TPO バイパス可（pre-edit.sh は 2026-05-31 にマーカー方式を撤去しチャット内承認へ移行・本マーカーは destructive command 用として独立維持）
- **deny 代替不可の理由**: `Bash(rm -rf:*)` deny は単純 prefix のみで `rimraf` / `find -delete` / `taskkill /F` / `node -e fs.rmSync` をカバーできない。任意位置 wildcard (`Bash(*rimraf*)` 等) は安全 command 巻き添え block の弊害があり禁止（a-b-c-3-jazzy-squid plan で確認）

### git の無差別 stage（共有 index sweep）は hook で防御

- `.claude/hooks/pre-git-staging-gate.mjs`（PreToolUse:Bash・**全 product に propagate**＝パス非依存ゆえ root専用にしない）
- 検知対象: `git add -A` / `git add --all` / `git add .` / `git commit -a` / `-am` / `--all`
- **理由**: 複数セッションが単一 working tree / 単一 index を共有する環境で、これらは**他セッションが staged 中のファイルまで巻き込んで commit**し「commit 食われ」を起こす（failures L95/L103・2026-06-21 実証）。**path-scoped staging（`git add <明示パス>` / `git commit -- <明示パス>`）を機械強制**する（AI 規律でなく hook で）。
- 通過: 明示パス add / `git add -- <path>` / `git add -p` / `git commit -m`（`-a` 無し）/ `git commit -- <path>` / `git commit --amend` / 複合コマンド(`;&\`$()`含む=safe-side) / バイパス `.allow-add-all`（10 分 TTL）
- **deny 代替不可の理由**: `git add` / `git commit` は安全用途が大半で prefix deny は巻き添えが大きい。`-A|.|-a` だけを文字列解析で選別する hook が適切。

### `.claude/skills|agents|commands` の書込

- **公式 Protected Paths 仕様**（`code.claude.com/docs/en/permission-modes`）で同パスを「Claude routinely creates content」として Protected Paths 対象から **明示除外**
- vibe-base 独自 HARD BLOCK は a-b-c-3-jazzy-squid plan 段階 A で撤去（公式 PROMPT 経路に一本化）
- `pre-edit.sh` の `.vercel/` 検出による本番デプロイ済プロダクトの保護は別目的・維持。ただし block ではなく**チャット内承認(ask)** に変更（公式 `permissionDecision:"ask"` を stdout 出力・settings.json 直接起動）。探索は `/products/` サブツリー内のみ（ルート `.vercel` は無視）。旧 `.allow-prod-edit` ターミナルマーカー方式は撤去・チャット内 1 クリック承認に移行（flickering-hugging-flame plan・2026-05-31）

### path-resolver は CLI ラッパー経由（`node -e` ask 化と整合）
- 正規呼出: `node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root|--product-root|--vault-root|--master-name-file`
- 旧 `node --input-type=module -e "import(...)"` 形式は廃止（任意コード実行ゲート閉鎖のため）
- **A-20 実機プローブ結果（2026-07-10）**: `VIBE_BASE_ROOT=$(node .../resolve-paths.mjs ...)` のような環境変数代入+コマンド置換プレフィックスは `Bash(VAR=$(node ...) *)` 形の allow ルールでは前方一致せず ask が消えない（FAIL 確定）。素の `node ~/.claude/skills/_shared/resolve-paths.mjs ...`（代入無し）は既存 `Bash(node:*)` allow で解消済。allow ルールの追加は行わず、恒久対応は skill 正本（独立 repo `rahiseko-alt/claude-skills-base`）側で SKILL.md の呼出記法を「シェル変数代入を使わない」形へ改修する方向とする（未実施・別 commit）

### スコープ分離（既存規定の継続）
- **`.claude/settings.json`**: Project スコープ（git tracked）。チーム共有（`permissions.deny` / `permissions.ask` / `hooks`）
- **`.claude/settings.local.json`**: Local スコープ（**gitignored 必須**）。個人（`permissions.allow` 自動追記、シークレット混入リスク）
- **hooks の配置先**: `settings.json`（Project）。`propagate-hooks.mjs` で全 product 自動配布
- **command のパス記述**: `"$CLAUDE_PROJECT_DIR"` 環境変数（ハードコード絶対パス禁止）

### スコープ間優先度（公式仕様・E-2・claude-code-guide 2026-07-10 確認済）
- **出典**: `https://code.claude.com/docs/en/permissions.md`「Settings precedence」「Manage permissions」節
- **スコープの優先順位（高 → 低）**: Managed settings（組織） > CLI 引数（セッション一時） > `.claude/settings.local.json`（Local） > `.claude/settings.json`（Project） > `~/.claude/settings.json`（User）
- **同一ルールがスコープを跨いで衝突した場合**: どのスコープであっても **deny が allow に優先**する（公式明記: "If a tool is denied at any level, no other level can allow it."）。例: User スコープで `Bash(npm *)` を allow、Project スコープで deny → deny が勝つ。
- **この優先順位は「評価順序: Deny → Ask → Allow」（本文冒頭）とは別軸**。評価順序は 1 つの設定ファイル内でのルール種別の優先度、スコープ間優先度は複数ファイルが同じルールを持つ時にどちらの記述が生き残るかの話。両者を混同しない。

### 検証
- `node scripts/check-settings-spec.mjs`（A-1〜F-7 自動判定、check-in-verify.sh A-5 に組み込み済）
- F-4: `Bash(*)` 完全 wildcard 不在
- F-5: deny に `.env` / `.git/**` / `git push --force` 必須項目存在
- F-6: ask に任意コード実行ゲート登録
- F-7: 危険 wildcard 残骸 WARN（運用害なし・棚卸し推奨）

### 詳細
→ `memory/feedback_permission-defense-design.md`
