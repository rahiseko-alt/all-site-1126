# concept.md — animejs-add-items 概念層

## 1 つのコア技術

（出典: agent-ag/animejs-add-demo/index.html「script」節）

### 1. createLayout (動的追加とエントリ遷移)
**技術名**: createLayout / utils
**素人向け解説**: HTMLのグリッドなどに新しい要素が追加された際、既存の要素を自動的に綺麗な動きで押し退けつつ、新しく加わった要素を「下からふわっと浮き上がりながら拡大表示する」ような登場アニメーションを自動適用する機能です。

---

## アーキテクチャ概要

animejs-add-items: animejs v4.4.1
CDN: https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.esm.js
Entry: js/app.js | Style: css/style.css
Main class: createLayout, utils
（出典: agent-ag/animejs-add-demo/index.html L153〜L167）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 全体 | 背景色 | #0F0F11 |
| 全体 | テキスト色 | #E4E4E7 |
| 全体 | フォント | 'Inter', system-ui, -apple-system, sans-serif |
| パネル | コンテナ (.pane) | 背景色: #18181C, 枠線: 1px solid #27272A, 角丸: 16px, パディング: 1.5rem, 最大幅: 480px, 影: 0 20px 40px rgba(0, 0, 0, 0.6) / 0 0 30px rgba(59, 130, 246, 0.05) |
| パネル | タイトル (h2) | フォントサイズ: 1.3rem, 太さ: 700, 背景色（グラデーション）: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%) |
| パネル | 説明テキスト (p) | フォントサイズ: 0.85rem, テキスト色: #A1A1AA |
| ボタン | 通常時 (.btn) | 背景: rgba(255, 255, 255, 0.02), 枠線: 1px solid #27272A, テキスト色: #E4E4E7, パディング: 0.8rem 1.2rem, 角丸: 10px, フォントサイズ: 0.9rem, 太さ: 600 |
| ボタン | ホバー時 (.btn:hover:not(:disabled)) | 背景（グラデーション）: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%), 枠線: transparent, テキスト色: #FFFFFF, 影: 0 4px 15px rgba(37, 99, 235, 0.4) |
| ボタン | アクティブ時 (.btn:active:not(:disabled)) | トランスフォーム: scale(0.98) |
| ボタン | 無効化時 (.btn:disabled) | 不透明度: 0.3, カーソル: not-allowed |
| レイアウト | コンテナ (.layout-container) | グリッド列: repeat(4, 1fr), ギャップ: 12px, 最小高さ: 250px, 背景色: rgba(0, 0, 0, 0.3), 角丸: 12px, パディング: 12px, 枠線: 1px solid rgba(255, 255, 255, 0.05) |
| グリッド項目 | 通常時 (.item) | アスペクト比: 1, 角丸: 10px, フォントサイズ: 1.3rem, 太さ: 700, テキスト色: #FFFFFF, 背景（グラデーション）: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%), 枠線: 1px solid rgba(96, 165, 250, 0.2), 影: 0 6px 14px rgba(0, 0, 0, 0.4) / 0 0 10px rgba(37, 99, 235, 0.1) |
| グリッド項目 | ホバー時 (.item:hover) | トランスフォーム: scale(1.05) |

アニメーション設定:
* 全体アニメーション時間 (duration): 250
* イージング (ease): 'outQuad'
* エントリ時設定 (enterFrom):
  * transform: 'translateY(100px) scale(.25)'
  * opacity: 0
  * duration: 350
  * ease: 'out(3)'

追加アクション:
`.btn` (Add Item) クリック時に、`layout.update` 内で `div` 要素（`.item` クラス付与、値はカウントのインクリメント）を新規作成し、`count > 15` の時は追加を中止しつつボタンを `disabled` 化する。それ以外の場合は `.layout-container` (root) に追加する。
（出典: agent-ag/animejs-add-demo/index.html L158〜L179）

---

## 既知 of 改善点

* **最大数制限のカスタマイズ**: カウント上限のしきい値 15 やボタン無効化の挙動を、要件に合わせて外部設定化または動的制御できるように改善する。
