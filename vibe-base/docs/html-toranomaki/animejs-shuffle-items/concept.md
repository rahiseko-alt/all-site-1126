# concept.md — animejs-shuffle-items 概念層

## 1 つのコア技術

（出典: agent-ag/animejs-shuffle-demo/index.html「script」節）

### 1. createLayout
**技術名**: createLayout / utils
**素人向け解説**: HTML要素の並び順（DOMの構造）が変わったことを自動で検知し、元あった場所から新しい場所への移動を滑らかにアニメーションさせる機能です。複雑な座標計算をしなくても、要素の並び替え（ソートやシャッフル）が心地よい動きになります。

---

## アーキテクチャ概要

animejs-shuffle-items: animejs v4.4.1
CDN: https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.esm.js
Entry: js/app.js | Style: css/style.css
Main class: createLayout, utils
（出典: agent-ag/animejs-shuffle-demo/index.html L157〜L171）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 全体 | 背景色 | #0F0F11 |
| 全体 | テキスト色 | #E4E4E7 |
| 全体 | フォント | 'Inter', system-ui, -apple-system, sans-serif |
| パネル | コンテナ (.pane) | 背景色: #18181C, 枠線: 1px solid #27272A, 角丸: 16px, パディング: 1.5rem, 最大幅: 480px, 影: 0 20px 40px rgba(0, 0, 0, 0.6) / 0 0 30px rgba(139, 92, 246, 0.05) |
| パネル | タイトル (h2) | フォントサイズ: 1.3rem, 太さ: 700, 背景色（グラデーション）: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%) |
| パネル | 説明テキスト (p) | フォントサイズ: 0.85rem, テキスト色: #A1A1AA |
| ボタン | 通常時 (.btn) | 背景: rgba(255, 255, 255, 0.02), 枠線: 1px solid #27272A, テキスト色: #E4E4E7, パディング: 0.8rem 1.2rem, 角丸: 10px, フォントサイズ: 0.9rem, 太さ: 600 |
| ボタン | ホバー時 (.btn:hover) | 背景（グラデーション）: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%), 枠線: transparent, テキスト色: #FFFFFF, 影: 0 4px 15px rgba(124, 58, 237, 0.4) |
| ボタン | アクティブ時 (.btn:active) | トランスフォーム: scale(0.98) |
| レイアウト | コンテナ (.layout-container) | グリッド列: repeat(4, 1fr), ギャップ: 12px, 最小高さ: 250px, 背景色: rgba(0, 0, 0, 0.3), 角丸: 12px, パディング: 12px, 枠線: 1px solid rgba(255, 255, 255, 0.05) |
| グリッド項目 | 通常時 (.item) | アスペクト比: 1, 角丸: 10px, フォントサイズ: 1.3rem, 太さ: 700, テキスト色: #FFFFFF, 背景（グラデーション）: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%), 枠線: 1px solid rgba(167, 139, 250, 0.2), 影: 0 6px 14px rgba(0, 0, 0, 0.4) / 0 0 10px rgba(124, 58, 237, 0.1) |
| グリッド項目 | ホバー時 (.item:hover) | トランスフォーム: scale(1.05) |

アニメーション: `layout.update` 内で `.layout-container` (root) の子要素である `.item` 要素のリストを `utils.shuffle` にかけてシャッフルしたうえで、再度 root に `appendChild` して順序を入れ替える。これにより Anime.js が自動で要素の移動をアニメーションさせる。
（出典: agent-ag/animejs-shuffle-demo/index.html L163〜L168）

---

## 既知 of 改善点

* **トランジション設定のカスタマイズ**: `createLayout` 生成時に duration や ease などのカスタムパラメータを渡すことで、シャッフルアニメーションの挙動を調整できる。
