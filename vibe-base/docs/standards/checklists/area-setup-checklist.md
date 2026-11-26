# 運用エリア新設チェックリスト（vest1）

> 新しい運用エリア（`docs/ops/{area}/`）を作るときに使う。
> 全項目完了しないと、hookがファイル書込をブロックする。

---

## なぜこの4点が必要か

| # | 成果物 | 役割 | なければどうなる |
|---|--------|------|-----------------|
| 1 | SOP | 手順書。人間もAIも読む | エージェントが何をどう書けばいいか分からない |
| 2 | Rules | パス発火でルール注入 | エリアのファイルを触ったとき、ルールがコンテキストに入らない |
| 3 | Hook | フォーマット強制 | ルールを読まないエージェントが不正なファイルを書ける |
| 4 | 動線マップ掲載 | 全エージェントに常時注入 | エリアの存在自体を知らないエージェントがルールに到達できない |

**1〜3を作っても4がなければ、ルールは「触った人にしか見えない」まま。4が「読ませる仕組み」。**

---

## チェックリスト

エリア名を `{area}` とする（例: `research-bank`, `listings`）。

### 1. SOP作成

- [ ] `docs/ops/{area}-sop.md` を作成
- 内容: §0目的 / §1権限 / §2ファイル命名 / §3ライフサイクル / §4禁止事項
- 既存SOPを参考にせよ（`docs/ops/research-bank-sop.md` 等）

### 2. Rules作成

- [ ] `.claude/rules/{area}.md` を作成
- frontmatterに `paths: ["docs/ops/{area}/**"]` を設定
- 内容: 権限・フォーマット要件・参照SOP

```yaml
---
description: {エリアの説明}
paths:
  - "docs/ops/{area}/**"
---
```

### 3. Hook登録

- [ ] `.claude/hooks/area-gate.mjs` の `AREAS` 配列にエントリ追加
- [ ] vibe-baseルートで `node scripts/propagate-hooks.mjs` を実行（hook設定を全プロダクトのsettings.local.jsonに伝播。プロダクトエージェントからは実行不可）

```javascript
{
  name: '{area}',
  pathPattern: /[/\\]docs[/\\]ops[/\\]{area}[/\\]/,
  validate: (toolName, input) => {
    // Editは通す
    if (toolName === 'Edit') return null;
    if (input.file_path && input.file_path.endsWith('.gitkeep')) return null;
    const content = input.content || '';
    // ここにフォーマット検証を書く
    // 不正なら文字列を返す（blockメッセージ）、正常ならnull
    return null;
  },
},
```

### 4. 動線マップ掲載

- [ ] `.claude/rules/session-lifecycle.md` の「運用エリア動線」テーブルに1行追加

```markdown
| {作業名} | `docs/ops/{area}/` | `docs/ops/{area}-sop.md` |
```

**これにより全エージェントのcheck-in時にこのエリアの存在とSOPパスが注入される。**

---

## 検証

全項目完了後、以下でテスト:

```bash
# ブロックされないことを確認
echo '{"tool_input":{"file_path":"C:/Users/user/Desktop/ClaudeCode/vibe-base/docs/ops/{area}/test.md"}}' | bash scripts/check-rules-coverage.sh

# フォーマット違反がブロックされることを確認
echo '{"tool_name":"Write","tool_input":{"file_path":"C:/Users/user/Desktop/ClaudeCode/vibe-base/docs/ops/{area}/test.md","content":"フォーマット違反テスト"}}' | node .claude/hooks/area-gate.mjs
```

---

## 検証を担保する仕組み

| 仕組み | ファイル | 何をする |
|--------|---------|---------|
| `check-rules-coverage.sh` #4 | `scripts/check-rules-coverage.sh` | 上記4項目の存在をチェック。欠けていればブロック |
| `area-gate.mjs` | `.claude/hooks/area-gate.mjs` | 書込時のフォーマット検証 |
| `session-lifecycle.md` | `.claude/rules/session-lifecycle.md` | 全エージェントへの動線注入 |
| `propagate-hooks.mjs` | `scripts/propagate-hooks.mjs` | hookを全プロダクトのsettings.local.jsonに伝播 |

---

vest1 | v1.1 | 2026-04-08 | hook伝播ステップ追加
vest1 | v1.0 | 2026-04-08
