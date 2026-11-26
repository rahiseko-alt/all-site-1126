# learning-suite-kanji-foreign memory archive (2026-06)
> 元 products/learning-suite-kanji-foreign/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P1 詳細（縮小前）

1. [importance:H][2026-05-29] SQLite/WASM撤退後の掃除 — 記憶機能は `src/lib/utils/clearedKanji.ts` + localStorage を正本に確定。次回は未使用化した `src/lib/db/*` / `@capacitor-community/sqlite` / `jeep-sqlite` / `sql.js` / `static/assets/sql-wasm.wasm` / DB関連テストを、将来要否確認後に削除またはADR化する。あわせて未使用CSS警告（play/select）と `TraceCanvas.svelte` の `study_log` 前提コメントを掃除。
2. [importance:H][2026-05-22] 実機/画面での動作確認 — `できた` 押下→localStorage保存→admin反映→アプリ再起動保持→同一漢字重複なし、を手動で確認する。
3. [importance:H][2026-06-02] 本番独自ドメイン最終確認 — Cloudflare Pages `senbon` へ build deploy 済み、Pages custom domain `senbon.kouheikosehira.com` は `verification: active` まで確認済み。次回は `https://senbon.kouheikosehira.com/` の実ブラウザ疎通、`/admin` 疎通、Cloudflare Pages domain list 反映、runbook 本番URL更新を確認する。
4. [importance:M][2026-06-02] 1000字訳語の品質改善 — `docs/research/kanji-translated-1000-zh-vi-ne-review.md` に記録した fallback 538 行（vi/ne の概念訳）を段階的に固有訳へ改善する。構造QAはPASS済み。
5. [importance:M][2026-05-22] 設定機能の再構築 (画像アセット追加を廃止したため、言語切り替え等に最適化したシンプルな設定機能の検討)

## P4: 永続教訓

0. **[importance:H][2026-05-27] 追加漢字UI/導線の確定仕様**:
   - カテゴリーは `保存漢字 / 人気漢字 / 試験漢字` の 3 つを運用（旧カテゴリ `基本の一字 / 日本の大都市 / 地方と自然` は選択UIから除外）
   - 選択カード内上端中央に `すべて選ぶ` ボタンを配置（カテゴリ内全選択）
   - 保存操作は **select ページの漢字カード右側ボタン**のみ（play 側の保存UIは禁止）
   - 学習導線は `漢字選択ページ -> 記入ページ` 直行（中間の「選択漢字を書こう」ページは廃止）
   - 読み表示は `よみ 【訳語】` 形式で固定（訳語は選択言語に追従。例: `ほん 【book】`）
1. **ブランド確定（Senbon 世界観）2026-05-19**:
   - ブランド名: **Senbon**（千本鳥居メタファー・千文字習得=千本鳥居完成の進捗物語）
   - マスコット: **筆狐**（fude-gitsune・神社固有種・MVP は静止画 1 体・将来 100/300/1000 字で進化演出）
   - 配色 4 色: 和紙 `#F5F0E6` / 朱 `#C84A3A` / 墨 `#262626` / 深藍 `#355070`（配分: 和紙 55% / 朱 20% / 墨 15% / 藍 10%）
   - 世界観: Torii Pilgrimage / Path of Kanji
   - ドメイン: `senbon.kouheikosehira.com`（既存ドメインのサブ・コスト 0）
   - MVP 演出範囲: 最小（筆狐 1 体・静止画・進捗バー）。100/300/1000 字マイルストーン演出は v2 以降
   - リサーチ根拠: `docs/research-bank/lskf-design-naming-research-2026.html` + `lskf-japan-affinity-naming-2026.html` + セカンドオピニオン採用
2. **削除済みアニメ（Phase A 以降）**:
   - 削除: 花火 / 紙吹雪 / 踊る動物 / キャラクター bob / 雲星 bg-decor / お祝い文字「やったね！！」/ praise-emoji 🎉
   - 残存: カウントダウン 3-2-1（startKanji 時のみ）/ 多色画数 SVG 3 状態（なぞり中）
3. **create-image スキル経由要件**: ホーム背景 + 筆狐 + ロゴ全て `/create-image` 発火経由・直接 generate.py 禁止
