# ライブラリ実在性チェックリスト（vest1）

> **対象:** AI（Claude含む）が新規パッケージ追加を提案・実装した全プロダクト
> **使用タイミング:** `npm install` / `pip install` 実行前 / package.json への追加前
> **起源:** Qiita#11「AI提案ライブラリの実在性確認」をチェックリスト化

---

## なぜこのチェックリストが必要か

LLM（Claude含む）は**実在しないパッケージ名を「それっぽく」生成することがある**（hallucinated packages）。これを検証せずに `npm install` すると：

1. **タイポスクワッティング攻撃にひっかかる** — 攻撃者が「実在しない名前」と「実在する名前の typo」を先回り登録し、マルウェアを混入させる手口
2. **メンテ放棄パッケージを掴む** — 5年前から更新なし、脆弱性放置のパッケージを使い続ける
3. **GPL汚染** — GPL系ライセンスを商用クローズドソースに混入させ、ソース公開義務を負う
4. **依存爆発** — 1つのパッケージが100以上の依存を引き連れ、攻撃面とビルド時間が爆発

**AIが提案したパッケージ名 = 「未確認の文字列」**。`install` 前に本チェックリストで実在性を検証する。

---

## §1. npm / pip 公式リポジトリでの実在性確認

### npm
```bash
npm view {package-name}                      # 存在確認
npm view {package-name} version              # 最新バージョン
npm view {package-name} repository.url       # GitHubリポジトリURL
npm view {package-name} maintainers          # メンテナ一覧
```

### pip / PyPI
```bash
pip index versions {package-name}            # 存在確認 + バージョン一覧
pip show {package-name}                      # インストール済みなら詳細
curl -s https://pypi.org/pypi/{package-name}/json | jq '.info'
```

### 確認ポイント
- 「Not found」エラー → AIの hallucination の可能性。**install禁止**
- 公式repoのURLが存在しない or 無関係なドメイン → 不審。**install禁止**
- README が空 or プレースホルダーのみ → 不審。**install禁止**

---

## §2. 最終更新日・スター数・Issue数

### 評価基準
| 指標 | 健全 | 注意 | 危険 |
|---|---|---|---|
| **最終更新日** | 半年以内 | 半年〜2年 | 2年以上更新なし |
| **GitHub Stars** | 100以上 | 10〜100 | 10未満（広く使われていない） |
| **Open Issues** | 5%以下/Stars | 5〜20%/Stars | 20%超/Stars（メンテ追いついてない） |
| **直近Pull Request数** | 月1以上 | 四半期1以上 | 1年マージなし |

### 例外
- 安定したユーティリティ（`leftpad`等のシンプル関数）は更新少なくてもOK
- 公式（npm orgs: `@types/*`, `@nestjs/*`, `@aws-sdk/*` 等）は基準緩和可

### 取得コマンド
```bash
# GitHub API経由（PERSONAL_TOKEN推奨）
curl -s https://api.github.com/repos/{owner}/{repo} | jq '{stars: .stargazers_count, updated: .updated_at, issues: .open_issues_count, pushed: .pushed_at}'
```

---

## §3. メンテナの活動状況

### 確認項目
- メンテナ複数いるか？（単独メンテは bus factor=1 でリスク）
- メンテナが他のメジャーOSSに参加しているか？（実在の人物 / 組織か）
- 最終コミットの著者と initial commit の著者が同じか別か？
- npm の `maintainers` フィールドと GitHub repo のオーナーが整合しているか？

### 危険サイン
- メンテナが GitHub 上で「アカウント作成日 < 1年」かつ単独
- npm publish 履歴が他にゼロ（このパッケージだけのアカウント）
- メンテナのメールアドレスが使い捨てドメイン（10minutemail等）

---

## §4. ライセンス確認（GPL汚染防止）

### ライセンス区分
| 区分 | 例 | 商用クローズドソース利用 |
|---|---|---|
| **Permissive（OK）** | MIT / Apache 2.0 / BSD-2/3 / ISC | 自由（表記必須） |
| **Weak Copyleft（条件付き）** | MPL 2.0 / LGPL | 条件あり、要確認 |
| **Strong Copyleft（汚染リスク）** | GPL-2.0 / GPL-3.0 / AGPL | **使用禁止**（商用クローズド） |
| **Non-OSI / Custom** | ProprietaryLicense / SSPL | 個別読込必須、原則回避 |

### 確認コマンド
```bash
# プロジェクト全体の依存ライセンス一覧
npx license-checker --summary
npx license-checker --excludePackages 'package-self' --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0'
```

### GPL汚染検知時の対応
- 依存パッケージにGPL/AGPLが見つかったら、即座に代替を探す
- 代替がない場合は、サービス全体のソース公開（GPL）or 当該機能カット を選択
- 「気づかず公開」は法的リスクが大きいため、リリース前必須チェック

---

## §5. タイポスクワッティング検知

### 攻撃パターン
| 種類 | 例 | 検知方法 |
|---|---|---|
| **typo風** | `reqeust`（正: `request`） | levenshtein距離1〜2の人気パッケージ存在確認 |
| **大文字違い** | `React-DOM`（正: `react-dom`） | npm は小文字統一、混合は不審 |
| **スコープ偽装** | `@reactt/router`（正: `@react/router`） | スコープ名を公式と一致確認 |
| **拡張子偽装** | `lodash.js`（正: `lodash`） | 不要な拡張子付与は不審 |
| **同音異綴** | `cross-env-shell`（似た名前を装う） | 実在のパッケージ名と1字違いを警戒 |

### 確認手順
1. AIが提案したパッケージ名を Google検索（`"{package-name}" npm` で完全一致）
2. 公式サイト・公式GitHubと npm の repository フィールドが一致するか確認
3. 不審なら **代替パッケージを探す**（typo元の本物を使う）

### 過去の有名な攻撃事例
- `event-stream` （2018）: 正規パッケージに悪意あるメンテナを混入
- `colors` `faker` （2022）: メンテナによる意図的な破壊
- `ua-parser-js` （2021）: アカウント乗っ取りからのマルウェア混入

これらは「実在パッケージの侵害」なので、§3メンテナ確認も併用。

---

## §6. package-lock.json / requirements.txt でのバージョン固定

### npm
- `package-lock.json` を必ずコミット（gitignore しない）
- `npm ci` をCI/CDで使用（`npm install` ではなく）
- `peerDependencies` に `*` や `latest` を書かない、SemVer範囲で固定

### pip
- `requirements.txt` で `==` でバージョン固定（`>=` は本番非推奨）
- `pip-tools` の `pip-compile` で `requirements.lock` 生成
- 本番用と開発用を分離（`requirements.txt` / `requirements-dev.txt`）

### 固定の理由
- 同一バージョンでビルドを再現可能にする（reproducibility）
- 攻撃者がメンテナ乗っ取りで新バージョンに悪意を混入しても、自動取り込みされない

---

## §7. npm audit / Snyk スキャン

### 既知脆弱性チェック
```bash
npm audit                                    # 既知脆弱性一覧
npm audit --audit-level=high                 # high以上のみ
npm audit fix                                # 自動修正（互換範囲のみ）
npm audit fix --force                        # メジャーバージョンも上げる（要動作確認）
```

### より厳密なツール
- **Snyk:** `snyk test`（無料枠あり、CI連携可）
- **Dependabot:** GitHub標準、PR自動作成
- **OSV-Scanner:** Google製、Go/Rust/Pythonも対応

### 対応基準
- **Critical / High:** リリース前に必ず解消（修正版へアップグレード or パッケージ差し替え）
- **Moderate:** 1ヶ月以内に対応、トラッキング必須
- **Low:** 四半期レビューで判断

### 監視の自動化
- GitHub Dependabot を有効化
- CI/CD で `npm audit --audit-level=high` をfail条件に組み込む

---

## §8. チェックリスト

新規パッケージを `package.json` / `requirements.txt` に追加する前に、下記を全件確認。

- [ ] §1 公式リポジトリ（npm / PyPI）でパッケージ名が完全一致で実在することを確認した
- [ ] §1 GitHub repo URL が実在し、READMEが充実していることを確認した
- [ ] §2 最終更新日が半年以内、または公式系で長期安定パッケージであることを確認した
- [ ] §2 GitHub Stars が100以上、または明確に必要な小規模ユーティリティであることを確認した
- [ ] §3 メンテナが単独でない、または公式組織管理であることを確認した
- [ ] §4 ライセンスがPermissive（MIT/Apache/BSD/ISC等）、商用クローズドソースで利用可能であることを確認した
- [ ] §5 タイポスクワッティングではないこと（公式名と完全一致）を Google検索で確認した
- [ ] §6 `package-lock.json` / `requirements.txt` でバージョン固定し、コミットした
- [ ] §7 `npm audit` / `pip-audit` で High以上の脆弱性が無いことを確認した
- [ ] 代替パッケージとの比較（少なくとも1つ）を行い、本パッケージを選んだ理由を記録した

**全項目クリアで `npm install` / `pip install` 実行可。1項目でも未達なら追加禁止。**

---

## §9. AIが新規パッケージを追加した時の実行手順（必読）

Claude等のAIエージェントが「`npm install xxx` してください」と提案した場合、**install前に必ず以下を実行**する。

```bash
# 1. 実在性確認（必須）
PKG="提案されたパッケージ名"
npm view "$PKG" 2>/dev/null && echo "EXISTS" || { echo "NOT FOUND - ABORT"; exit 1; }

# 2. メタ情報取得
npm view "$PKG" version
npm view "$PKG" repository.url
npm view "$PKG" license

# 3. GitHub活動確認（repository.urlから {owner}/{repo} を抽出）
REPO_URL=$(npm view "$PKG" repository.url | sed 's|git+||;s|.git$||')
echo "Check: $REPO_URL"

# 4. ライセンス検証
npm view "$PKG" license
# MIT, Apache-2.0, BSD-*, ISC のいずれかであることを確認

# 5. 監査
npm view "$PKG" deprecated
# undefined ならOK、メッセージあれば代替を探す
```

**この5ステップを通過しないパッケージは install 禁止**。AIに「実在しないパッケージを提案した」可能性があるため、AI自身に再確認を促す or 別のパッケージを探す。

---

## §10. 関連SOP

- `docs/ops/risk-diagnosis-sop.md`（依存パッケージのリスク評価。`npm audit` / 既知脆弱性確認を含む）
- `docs/ops/incident-response-sop.md`（脆弱性混入時の対応）

---

v1.0 | 2026-04-27 | 初版（構造改革プロジェクト T6）
