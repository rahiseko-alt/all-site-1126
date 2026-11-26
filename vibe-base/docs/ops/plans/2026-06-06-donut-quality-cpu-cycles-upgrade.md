# Donut Quality CPU Cycles Upgrade Implementation Plan

> **For agentic workers:** REQUIRED DISCIPLINE: this plan improves donut object quality only. Ignore composition, mug, plate, table, and cafe staging except where they affect donut material lighting. Use CPU-only Cycles optimization and keep all work isolated under `outputs/blender-donut-tutorial/quality-v2/`.

**Goal:** 添付画像に近い「高品質なドーナツ本体」を、GPUなしCPU環境で現実的な待ち時間に収めて再生成する。

**Architecture:** 既存の Part 7/8 成果物を入力資産として読み込み、別系統の `quality-v2` 出力でドーナツ、icing、sprinkles、生地マテリアル、Cycles設定だけを再設計する。作業中は低解像度/低sampleの反復レンダ、評価ゲートは中sample、最終のみ高sampleで実行する。

**Tech Stack:** Blender `4.5.10 LTS`, Blender Python, Cycles CPU, Adaptive Sampling, OpenImageDenoise, PowerShell, `view_image`, sub-agent orchestration.

---

## Context

- 上位 plan: `C:\Users\user\Desktop\ClaudeCode\vibe-base\docs\ops\plans\2026-06-03-blender-donut-source-trace.md`
- 入力候補 `.blend`: `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\part-07\part-07.blend`
- 参照用現状 final: `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\final\donut-final-eevee.png`
- 新規出力 root: `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2`
- Blender executable: `C:\Users\user\Desktop\ClaudeCode\vibe-base\tools\blender\blender-4.5.10-windows-x64\blender.exe`
- GPU前提: なし。CPU Cycles のみで設計する。
- ユーザー指示: ドーナツ品質差だけを扱う。構図、マグ、皿、テーブル、カフェ演出の議論は範囲外。

### 品質差の対象

| 対象 | 現状の弱点 | 目標 |
|------|------------|------|
| Icing | 色付き膜に近く、厚み、濡れた反射、微細な表面変化が弱い | 厚いグレーズ、滑らかな強ハイライト、低roughness、微細bump |
| Sprinkles | 本数と可視性はあるが、サイズ、密度、色、材質、丸みが参照より粗い | 小型、高密度、離散色、丸い端、軽い光沢、自然な向き |
| Dough | 焼き色ムラ、粒状感、柔らかい生地感が弱い | 焼き菓子らしい色ムラ、細かいnormal、弱いSSS/roughness変化 |
| Render | `BLENDER_EEVEE_NEXT` 64 samples の近似レンダ | CPU Cycles + adaptive + denoise で質感評価に耐える出力 |

## 上位 plan からの constraint 変更

| 上位 / 指示 | 本 plan での扱い | 理由 |
|-------------|------------------|------|
| `2026-06-03-blender-donut-source-trace.md` は Part 1-8 の工程トレース | 本 plan は Part 7/8 後の品質改善に限定 | ソーストレース自体は完了済みで、今回は品質差の解消が目的 |
| final は cafe-style render として mug/plate/table を含む | 本 plan の評価対象から除外 | ユーザーが「ドーナツの品質のみ、構図は無視」と明示 |
| final は Eevee でも可 | 本 plan は Cycles CPU を品質評価の正本に変更 | 参照級の光沢、接触影、微細材質には Cycles の方が適合 |
| サブエージェント併用 | 調査/実装/検証で分担継続 | Orchestrator が直接作り込みを抱え込まないため |

## 影響範囲

| 種別 | path | 責務 / 照合 |
|------|------|-------------|
| 新規作成済み | `C:\Users\user\Desktop\ClaudeCode\vibe-base\docs\ops\plans\2026-06-06-donut-quality-cpu-cycles-upgrade.md` | 本 plan。作成前 `Test-Path` 結果は `False` |
| 参照のみ | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\part-07\part-07.blend` | ドーナツ、icing、sprinkles の入力候補 |
| 参照のみ | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\part-08\part-08-build.py` | 現状 render settings の差分確認 |
| 参照のみ | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\part-08\part-08-build-log.md` | 現状 `BLENDER_EEVEE_NEXT`, samples, camera metadata の確認 |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-cycles-build.py` | 品質改善 build script。作成前 `Test-Path` 結果は `False` |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-checklist.md` | Sub A の品質要件チェックリスト。root directory 作成前 `Test-Path` 結果は `False` |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-lookdev-01.png` | 低sample icing/dough確認レンダ |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-lookdev-02.png` | 低sample sprinkle確認レンダ |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-mid.png` | 中sample評価レンダ |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-final.png` | 最終レンダ。作成前 `Test-Path` 結果は `False` |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-final.blend` | 最終 `.blend` |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-qa.md` | Verify agent のQA結果 |
| 新規作成予定 | `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-build-log.md` | 再現性メタデータ |

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|------------|------|
| 0 | plan を re-read し、`quality-v2` 配下の予定 path が存在しないこと、入力 `.blend` と Blender executable が存在することを確認 | Orchestrator | `Test-Path` 結果を作業ログに記録 |
| 1 | ドーナツ品質要件を checklist 化する。対象は icing, sprinkles, dough, render settings の4分類だけ | explore-agent / Haiku相当 | `donut-quality-checklist.md` に4分類とPASS条件がある |
| 2 | 入力 `.blend` の中身を inspect し、donut, icing, sprinkle object/material names、modifier、object count を一覧化 | explore-agent / Haiku相当 | inspect結果に対象 object 名、sprinkle数、material名がある |
| 3 | `donut-quality-cycles-build.py` の骨格を作る。入力読み込み、出力root作成、Cycles CPU設定、段階render presetを定義 | implement-agent / Sonnet相当 | `--background --python-exit-code 1` で script syntax/run smoke EXIT 0 |
| 4 | CPU向けCycles設定を入れる。Adaptive Sampling, OpenImageDenoise, tile/thread default, persistent data, resolution presetsを固定 | implement-agent | build log に engine `CYCLES`, device `CPU`, samples, denoise, noise threshold が出る |
| 5 | Dough material を作り直す。焼き色ムラ、粒状normal、roughness variation、弱い subsurface を node/procedural texture で作る | implement-agent | `lookdev-01` で生地に色ムラと粒状感が見える |
| 6 | Icing material を作り直す。厚いglaze向けに low roughness, high specular/coat, micro bump, slight color variation を入れる | implement-agent | `lookdev-01` でハイライトが滑らかに乗り、膜が平板に見えない |
| 7 | Icing geometry を補正する。厚み、垂れ、縁の丸み、表面の滑らかさを強め、z-fightingや浮きを除去 | implement-agent | inspectで icing が donut に接触し、renderで破綻が見えない |
| 8 | Sprinkles を再生成または既存置換する。小型化、高密度化、丸い端、短/長/曲がり variant、離散色 palette を作る | implement-agent | inspectで sprinkle数、variant数、色palette、平均サイズが記録される |
| 9 | Sprinkles の配置を再計算する。icing上面mask、min distance、ランダム角度、表面法線追従、微小offset を適用 | implement-agent | `lookdev-02` で埋没/浮き/裏面配置が目立たない |
| 10 | ドーナツ品質評価用の簡易ライトを設定する。材質確認用に大きめ area key と弱い fill を使い、不要物は render hide | implement-agent | mug/plate/table の見た目は評価対象外。ドーナツ材質が判定可能 |
| 11 | `800x600`, `64 samples`, denoise on で `lookdev-01` と `lookdev-02` をレンダし、画像確認する | verify-agent / Haiku相当 | `view_image` で icing/dough/sprinkles の個別PASS/FAILを記録 |
| 12 | FAIL項目だけを再実装する。最大3巡まで許可し、同じFAILが3回続いた場合は原因をQAに固定して停止 | implement-agent + verify-agent | QAに巡回回数と残課題が残る |
| 13 | `1280x960`, `256 samples`, adaptive + denoise で `donut-quality-mid.png` をレンダ | implement-agent | build command EXIT 0、render file exists、build log更新 |
| 14 | 中sample評価を行う。参照画像との差を icing/sprinkles/dough/render noise に限定して判定 | verify-agent | `donut-quality-qa.md` に4分類PASS/FAIL |
| 15 | CPU実測に合わせた最終設定 `1280x960`, `220 samples`, adaptive + denoise で `donut-quality-final.png` と `.blend` を保存 | implement-agent | final `.png` と `.blend` が存在し、build logに最終設定がある |
| 16 | 最終QAを実行する。全ファイル、画像、metadata、CPU-only設定、既存 trace 非破壊を確認 | verify-agent + Orchestrator | 受け入れ基準のコマンドが全てPASS |

## サブエージェント体制

| Agent | モデル方針 | 役割 | 入力として注入するドキュメント | 出力 |
|-------|------------|------|-------------------------------|------|
| Explore | 軽量モデル | 既存 `.blend` / script / log の確認、object名と品質差の抽出 | 本 plan、`2026-06-03-blender-donut-source-trace.md`、`part-08-build-log.md` | checklist, inspect summary |
| Implement | 標準実装モデル | build script と Blender scene の作成 | 本 plan、checklist、inspect summary | script, `.blend`, renders, build log |
| Verify | 軽量モデル | 受け入れ基準の機械検証と画像QA | 本 plan、checklist、build log、renders | `donut-quality-qa.md` |
| Orchestrator | 現セッション | path照合、逸脱判断、最終報告 | 本 plan | gate decision |

## CPU Only Render Strategy

| Preset | 用途 | Resolution | Samples | Adaptive | Denoise | 期待時間方針 |
|--------|------|------------|---------|----------|---------|--------------|
| Smoke | script/scene破綻検出 | `640x480` | `16` | on | on | 数十秒から短時間 |
| Lookdev | 材質の方向確認 | `800x600` | `64` | on | on | 待てる範囲で反復 |
| Mid | 品質判断 | `1280x960` | `256` | on | on | 主要判定用 |
| Final | 提出候補 | `1280x960` | `220` | on | on | CPUのみで約3分台に収める |

### Cycles CPU 設定方針

- `scene.render.engine = "CYCLES"`
- `scene.cycles.device = "CPU"`
- `scene.cycles.use_adaptive_sampling = True`
- `scene.cycles.adaptive_threshold = 0.02` for mid/final, `0.04` for lookdev
- `scene.cycles.samples = 64 / 256 / 500`
- `scene.cycles.use_denoising = True`
- denoiser は利用可能なら `OPENIMAGEDENOISE`
- clamp は過度なfireflyが出た場合のみ `sample_clamp_indirect` を低めに設定
- 透明・ボリューム・caustics は使わない。ドーナツ品質への寄与が小さくCPU負荷が重い

## 品質仕様

### Dough

| 項目 | 実装方針 | PASS条件 |
|------|----------|----------|
| 焼き色 | Noise/ColorRamp で底や側面に淡い濃淡を作る | 単色の茶色に見えない |
| 粒状感 | high frequency noise を bump/normal に薄く入れる | 拡大しなくても微細な凹凸感がある |
| 柔らかさ | roughness高め、subsurfaceを弱く入れる | プラスチックや金属に見えない |
| Icing境界 | icingの下から見える生地に暖色差を出す | 境界が平坦な帯にならない |

### Icing

| 項目 | 実装方針 | PASS条件 |
|------|----------|----------|
| 光沢 | roughness低め、specular/coat強め | 面に広いハイライトが出る |
| 厚み | geometry thickness と bevel-like丸み | 薄い紙や塗り面に見えない |
| 表面変化 | micro bump と低周波色ムラ | 完全なCG単色に見えない |
| 垂れ | 複数の長さ/太さ/先端丸み | 垂れが棒や板に見えない |

### Sprinkles

| 項目 | 実装方針 | PASS条件 |
|------|----------|----------|
| サイズ | 現状より小さめに統一しつつランダム差 | ドーナツに対して巨大に見えない |
| 密度 | icing上面中心に増量、穴と端を避ける | 参照のように情報量がある |
| 形状 | rounded cylinder, curved piece, short piece variants | 端が角張った単純棒だけに見えない |
| 色 | cyan, purple, white, yellow, pink系の離散palette | 連続rainbow noiseに見えない |
| 接地 | normal追従と微小offset | 浮き/埋没/裏面配置が目立たない |

## テスト方針

1. Path preflight:
   - `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\tools\blender\blender-4.5.10-windows-x64\blender.exe` must return `True`.
   - `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\trace\part-07\part-07.blend` must return `True`.
   - `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2` must return `False` before implementation.
2. Script smoke:
   - Run Blender background with `--python-exit-code 1`.
   - Expected: EXIT `0`, smoke render exists, build log has `CYCLES` and `CPU`.
3. Lookdev QA:
   - Use `view_image` on `donut-quality-lookdev-01.png` and `donut-quality-lookdev-02.png`.
   - Expected: icing, dough, sprinkles each have explicit PASS/FAIL.
4. Mid render QA:
   - `Test-Path donut-quality-mid.png` must return `True`.
   - QA must identify remaining quality issues only in the four allowed categories.
5. Final QA:
   - `Test-Path donut-quality-final.png` and `donut-quality-final.blend` must return `True`.
   - Build log must include Blender version, engine, device, samples, adaptive threshold, denoise mode, resolution, input `.blend`, output paths.
6. Non-destructive check:
   - Existing `trace\part-*` files must not be modified by this plan.
   - `git diff --stat` must show only the plan during planning, and during implementation only `quality-v2` plus approved plan/QA files.

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| CPU renderが長すぎる | Smoke/Lookdev/Mid の所要時間が許容を超える | samplesを `64 -> 32`, resolutionを `800x600 -> 640x480` に下げ、最終だけ高sample |
| Denoiseで細部が潰れる | Sprinklesやdough粒状感がぼやける | mid/final の denoise strength相当を弱める、samplesを上げる、texture frequencyを少し強める |
| Icingがプラスチックに見える | ハイライトが硬すぎる、表面が均一 | roughness/coat/bump/color variation を再調整 |
| Doughが粘土に見える | 焼き色や粒状感が不足 | color ramp範囲を広げ、normal/roughness variation を追加 |
| Sprinklesが玩具っぽい | サイズ過大、色過飽和、端が角張る | scale down、paletteを淡く、bevel/rounded capsを追加 |
| 既存成果物を壊す | `git diff` に `trace\part-*` が出る | 即停止し、変更理由を確認。既存traceを上書きしない |
| 参照級に届かない | QAで4分類のうち同一項目が3巡FAIL | 失敗原因を固定し、追加方針をマスターに確認してから次plan化 |

## 受け入れ基準

WHEN donut quality upgrade is implemented THE SYSTEM SHALL produce a CPU-rendered Cycles donut that improves icing, sprinkles, dough, and render quality without altering the prior trace outputs.

- `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\docs\ops\plans\2026-06-06-donut-quality-cpu-cycles-upgrade.md -> True`
- `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-cycles-build.py -> True` after implementation
- `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-final.png -> True` after implementation
- `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-final.blend -> True` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-build-log.md -Pattern "Render engine: CYCLES" -> match` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-build-log.md -Pattern "Device: CPU" -> match` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-qa.md -Pattern "Icing: PASS" -> match` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-qa.md -Pattern "Sprinkles: PASS" -> match` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-qa.md -Pattern "Dough: PASS" -> match` after implementation
- `Select-String -Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\quality-v2\donut-quality-qa.md -Pattern "CPU Cycles: PASS" -> match` after implementation
- `git diff --name-only` during implementation must not include existing `outputs/blender-donut-tutorial/trace/part-*` paths unless the master explicitly approves.

## 承認後モード

default（理由: 新規ファイルとCPU長時間レンダを含み、途中の画像QAで停止・方針調整が必要になる可能性が高いため。実装は implement-agent、検証は verify-agent に委譲し、orchestrator は path照合と最終判断のみ行う。）
