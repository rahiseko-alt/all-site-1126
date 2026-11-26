# Blender Donut Source Trace Implementation Plan

> **For agentic workers:** REQUIRED DISCIPLINE: source order is mandatory. Implement Part 1 through Part 8 only after the previous part passes QA. No worker may skip, merge, summarize-away, or replace a source step with imagination.

**Goal:** NotebookLM の `Blender Donut Tutorial` 8ソース本文を Part 1→8 の順にトレースし、Blender のドーナツ・マグ・皿・質感・スプリンクル・ライティングを段階成果物として作る。

**Architecture:** Orchestrator は raw source 読了済みの統合責任者として plan とゲート判定だけを担当する。承認後は Sub A が各 Part の操作チェックリスト化、Sub B が Blender 実装、Sub C が画像・ファイル・受け入れ基準 QA を行い、Part ごとに失敗時は同じ Part をやり直す。

**Tech Stack:** NotebookLM MCP/`nlm` CLI, Blender Python, Blender `4.5.10 LTS` local executable, PowerShell, `apply_patch`, `view_image`, sub-agent orchestration.

**Blender integration operating rules:** この plan は「スキル化」ではなく、Blender 連携時に毎回効く運用規律として扱う。Blender が正本であり、外部ツールは source 取得、チェックリスト化、Blender 起動、成果物検証だけに使う。

| Rank | Source | Rule |
|------|--------|------|
| Official | Blender Manual command line / Python API / Camera / Asset Browser | `--background`, `--python`, `--python-exit-code`, argument order, `register()` / `unregister()`, camera focal length / focus distance / DoF, Asset Browser library semantics are authoritative. |
| GitHub implementation | `blender-cli-rendering`, `add_camera_rigs`, `alcove-dof-visualizer`, `simple_camera_manager` | Use as implementation patterns, not hard dependencies. If unavailable locally, implement equivalent `bpy` behavior and document the fallback in QA. |
| Local operational rule | This plan | Apply the repeatable execution order, gates, recovery paths, and reproducibility tests below. |

### Blender 実行ルール

1. Use Blender background execution as the default: `blender --background --python-exit-code 1 --python <script> -- <script-args>`.
2. Keep Blender argument order explicit: set output paths / engine / scripts before the render command that consumes them.
3. Make every build script idempotent: clear only the target scene collection or create a fresh output file, then save `.blend`, render `.png`, and write a build log.
4. Record reproducibility metadata in each build or QA log: Blender version, engine, resolution, samples, camera lens, camera location, focus distance, active add-ons/fallbacks, script path, source part.
5. Treat optional camera/add-on helpers as helpers only. `add_camera_rigs`, `alcove-dof-visualizer`, `simple_camera_manager`, and Camera Switcher may guide the operation, but the acceptance path must still work with plain `bpy` equivalents.
6. Use Asset Browser/library workflow only for reusable external assets. Tutorial-local geometry/materials must remain script-reproducible or packed/local to the `.blend`.
7. Prefer fast Eevee gates for part QA unless the source demands Cycles or headless rendering fails; final render may use Eevee or Cycles, but the engine choice and reason must be logged.

### Camera 運用ルール

1. Lock composition first: target object group, camera subject, image aspect, and visible margins.
2. Adjust lens/focal length second: avoid changing distance and lens in the same pass.
3. Adjust camera distance third: preserve composition while choosing perspective compression.
4. Adjust DoF last: focus object or focus distance, f-stop, near/far readability.
5. Validate with a DoF visualizer if available; otherwise log equivalent `bpy` camera values and render a low-resolution focus check.
6. If framing fails twice, create a temporary diagnostic render with camera guides/contact-sheet angles and return to the previous part gate instead of continuing.

---

## Context

- NotebookLM notebook: `Blender Donut Tutorial`
- NotebookLM notebook ID: `433ea661-cdb9-45d5-971c-696325dcc70e`
- raw source directory: `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\sources`
- plan path: `C:\Users\user\Desktop\ClaudeCode\vibe-base\docs\ops\plans\2026-06-03-blender-donut-source-trace.md`
- local Blender executable: `C:\Users\user\Desktop\ClaudeCode\vibe-base\tools\blender\blender-4.5.10-windows-x64\blender.exe`
- prior approximate output under `C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial` is rejected and must not be treated as final evidence.
- Source reading status: Part 1 through Part 8 raw text has been fetched and read in order before this plan was written.

| Part | Source file | NotebookLM title | Required use |
|------|-------------|------------------|--------------|
| 1 | `outputs\blender-donut-tutorial\sources\part-01.txt` | `Blender Donut Tutorial Part 1 (2026)` | UI basics, torus donut, cylinder mug base, Solidify/Subsurf, loop cuts |
| 2 | `outputs\blender-donut-tutorial\sources\part-02.txt` | `Blender Basic Modelling Tutorial (Donut Part 2)` | reference-driven mug shaping, handle, normals, topology cleanup |
| 3 | `outputs\blender-donut-tutorial\sources\part-03.txt` | `Blender Basic Organic Modelling Tutorial (Donut Part 3)` | icing duplicate, shrinkwrap, solidify, drips, sculpt-like organic shaping |
| 4 | `outputs\blender-donut-tutorial\sources\part-04.txt` | `Blender Basic Materials Tutorial (Donut Part 4)` | plate, lattice deformation, camera/render basics, base materials |
| 5 | `outputs\blender-donut-tutorial\sources\part-05.txt` | `Blender Basic Texturing Tutorial (Donut Part 5)` | PBR map logic, table/plate/icing/donut UV and material setup |
| 6 | `outputs\blender-donut-tutorial\sources\part-06.txt` | `Blender Basic UV Unwrapping Tutorial (Donut Part 6)` | mug UV seams, handle unwrap, coffee foam object and atlas-style UV |
| 7 | `outputs\blender-donut-tutorial\sources\part-07.txt` | `How to Scatter in Blender 5.0 (Donut Part 7)` | sprinkle variants, scatter distribution, weight paint mask, Object Info color |
| 8 | `outputs\blender-donut-tutorial\sources\part-08.txt` | `The Basics of Lighting and Rendering in Blender (Donut Finale)` | parenting, sun/sky/bounce lights, blockers, Eevee/Cycles render settings |

## 上位 plan からの constraint 変更

| 上位 / 指示 | 本 plan での扱い | 理由 |
|-------------|------------------|------|
| 「ドーナツ作れ」 | 8 Part のチュートリアル工程トレースに格上げ | 既存の近似生成はユーザーに拒否されたため、ソース準拠へ変更 |
| 「まずプランを作れ」 | 実装前に本 plan で停止 | 承認前に Blender 実装を進めない |
| 「サブ3体で仕上げろ」 | Sub A/B/C の3役に分割 | 読解、実装、QAを分離して飛ばしを防止 |
| 「ソースを1から順に全て読め」 | Orchestrator 読了済み、各 Part 実装時にも該当 raw source を re-read | context drift と抜けを防ぐ |

## 影響範囲

| 種別 | path | 責務 / 照合 |
|------|------|-------------|
| 新規作成済み | `docs\ops\plans\2026-06-03-blender-donut-source-trace.md` | 本 plan。作成前 `Test-Path` 結果は ABSENT |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-01.txt` | Part 1 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-02.txt` | Part 2 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-03.txt` | Part 3 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-04.txt` | Part 4 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-05.txt` | Part 5 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-06.txt` | Part 6 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-07.txt` | Part 7 raw source |
| 参照のみ | `outputs\blender-donut-tutorial\sources\part-08.txt` | Part 8 raw source |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-01\part-01-checklist.md` | Sub A output。作成直前に `Test-Path` |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-01\part-01.blend` | Sub B output。作成直前に `Test-Path` |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-01\part-01.png` | Sub B render。作成直前に `Test-Path` |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-01\part-01-qa.md` | Sub C QA。作成直前に `Test-Path` |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-02\part-02-checklist.md` | Same pattern for Part 2 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-03\part-03-checklist.md` | Same pattern for Part 3 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-04\part-04-checklist.md` | Same pattern for Part 4 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-05\part-05-checklist.md` | Same pattern for Part 5 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-06\part-06-checklist.md` | Same pattern for Part 6 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-07\part-07-checklist.md` | Same pattern for Part 7 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\part-08\part-08-checklist.md` | Same pattern for Part 8 |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\final\donut-final-eevee.png` | final render。作成直前に `Test-Path` |
| 新規作成予定 | `outputs\blender-donut-tutorial\trace\final\donut-final.blend` | final Blender file。作成直前に `Test-Path` |

## 実装ステップ

| Step | 内容 | 担当 agent | 使用ツール | 検証 / ゲート |
|------|------|------------|------------|---------------|
| 0 | `trace` 配下の予定 path、Blender 実行環境、optional add-on 有無、headless smoke render を確認し、衝突や環境不足があれば停止 | Orchestrator | PowerShell + Blender background | sources 8件存在 / planned paths absent / Blender version logged / smoke render EXIT 0 |
| 1 | Part 1 raw source を re-read し、操作単位チェックリストを作る | Sub A: Step Extractor | Read/Grep only | `part-01-checklist.md` に source line/要点/操作/期待状態がある |
| 2 | Part 1 の torus donut と mug base を Blender で作る | Sub B: Blender Builder | `apply_patch`, Blender background | `part-01.blend` と `part-01.png` が生成される |
| 3 | Part 1 を QA し、不合格なら Step 1 へ戻す | Sub C: Visual QA | `view_image`, PowerShell read-only | Part 1 受け入れ基準 PASS |
| 4 | Part 2 raw source を re-read し、reference mug/handle 工程をチェックリスト化 | Sub A | Read/Grep only | `part-02-checklist.md` に reference/handle/topology cleanup がある |
| 5 | Part 2 の mug shaping と handle join を実装 | Sub B | Blender background | `part-02.blend` と `part-02.png` が生成される |
| 6 | Part 2 を QA し、不合格なら Step 4 へ戻す | Sub C | `view_image`, read-only | Part 2 受け入れ基準 PASS |
| 7 | Part 3 raw source を re-read し、icing/shrinkwrap/drip/sculpt 工程をチェックリスト化 | Sub A | Read/Grep only | `part-03-checklist.md` に modifier order が明記される |
| 8 | Part 3 の icing shell, drips, organic shaping を実装 | Sub B | Blender background | `part-03.blend` と `part-03.png` が生成される |
| 9 | Part 3 を QA し、不合格なら Step 7 へ戻す | Sub C | `view_image`, read-only | Part 3 受け入れ基準 PASS |
| 10 | Part 4 raw source を re-read し、plate/material/camera 工程をチェックリスト化 | Sub A | Read/Grep only | `part-04-checklist.md` に plate topology/lattice/material basics と camera framing note がある |
| 11 | Part 4 の plate, lattice-like deformation, base materials, cameraを実装 | Sub B | Blender background | `part-04.blend` と `part-04.png` と build log が生成される。構図固定→画角→距離→DoF の順を守る |
| 12 | Part 4 を QA し、不合格なら Step 10 へ戻す | Sub C | `view_image`, read-only | Part 4 受け入れ基準 PASS |
| 13 | Part 5 raw source を re-read し、PBR/UV/material 工程をチェックリスト化 | Sub A | Read/Grep only | `part-05-checklist.md` に color/normal/roughness/non-color がある |
| 14 | Part 5 の table, plate, icing, donut texture setup を実装 | Sub B | Blender background | `part-05.blend` と `part-05.png` が生成される |
| 15 | Part 5 を QA し、不合格なら Step 13 へ戻す | Sub C | `view_image`, read-only | Part 5 受け入れ基準 PASS |
| 16 | Part 6 raw source を re-read し、mug UV/foam 工程をチェックリスト化 | Sub A | Read/Grep only | `part-06-checklist.md` に seams/islands/foam がある |
| 17 | Part 6 の mug seam-style UV と coffee foam object を実装 | Sub B | Blender background | `part-06.blend` と `part-06.png` が生成される |
| 18 | Part 6 を QA し、不合格なら Step 16 へ戻す | Sub C | `view_image`, read-only | Part 6 受け入れ基準 PASS |
| 19 | Part 7 raw source を re-read し、sprinkle/scatter/weight mask 工程をチェックリスト化 | Sub A | Read/Grep only | `part-07-checklist.md` に scatter fallback 条件がある |
| 20 | Part 7 の sprinkle variants と distribution を実装 | Sub B | Blender background | `part-07.blend` と `part-07.png` が生成される |
| 21 | Part 7 を QA し、不合格なら Step 19 へ戻す | Sub C | `view_image`, read-only | Part 7 受け入れ基準 PASS |
| 22 | Part 8 raw source を re-read し、parenting/lighting/render 工程をチェックリスト化 | Sub A | Read/Grep only | `part-08-checklist.md` に light roles/render settings と camera framing note がある |
| 23 | Part 8 の hierarchy, lights, blockers, final render を実装 | Sub B | Blender background | `final\donut-final.blend` と final `.png` と build log が生成される。DoF 可視化または同等ログで最終フレーミングを確認 |
| 24 | final QA で全 Part の成果物と checklist/QA の chain を検証 | Sub C + Orchestrator | `view_image`, PowerShell | 全受け入れ基準 PASS。plan を re-read してから完了宣言 |

## Sub-agent 役割分担

| Agent | 役割 | 許可ツール | 禁止事項 | 出力 |
|-------|------|------------|----------|------|
| Orchestrator | raw source 読了済みの統合責任者。plan、順序ゲート、最終判断のみ担当 | Read, PowerShell read-only/check, `update_plan` | 承認前実装、source未読の推測、Part飛ばし | plan, gate decision |
| Sub A: Step Extractor | 各 Part の raw source を re-read し、操作をチェックリストへ変換 | Read/Grep, PowerShell read-only | Blender実装、画像評価、別Part混入 | `part-NN-checklist.md` |
| Sub B: Blender Builder | 承認済みチェックリストだけを Blender scene に反映 | `apply_patch`, Blender background, PowerShell | 未承認のデザイン追加、Part飛ばし、QA自己判定 | `.blend`, `.png`, build log |
| Sub C: Visual QA | 成果物を視覚・ファイル・チェックリストで判定 | `view_image`, PowerShell read-only | 編集、修正、合格の忖度 | `part-NN-qa.md`, PASS/FAIL |

## Part別受け入れ基準

### Part 1

WHEN Part 1 is implemented THE SYSTEM SHALL produce a basic donut and mug base matching the tutorial setup.

- `part-01.blend` exists and opens in Blender background with EXIT 0.
- `part-01.png` shows a smooth torus donut and a cup body behind/near it.
- Torus approximates tutorial proportions: major radius around `0.1`, minor radius around `0.057`, high segment count around `48 x 18`, shade smooth.
- Mug body starts from a low-vertex cylinder around 14 vertices, has top face removed, visible thickness via Solidify, smoothed via Subdivision Surface.
- Mug rim and bottom are controlled with loop cuts/inset-like geometry, not a raw over-smoothed cylinder.

### Part 2

WHEN Part 2 is implemented THE SYSTEM SHALL replace the rough cylinder with a reference-shaped mug and joined handle.

- `part-02.blend` exists and includes previous Part 1 objects plus refined mug.
- Mug silhouette has narrower top/foot shaping and reference-driven proportions.
- Handle is connected to the mug body with faces/bridged topology, not merely a disconnected floating curve.
- Internal join faces are removed or avoided; normals are recalculated so handle shading is smooth.
- Topology around handle uses roughly square faces/loops where possible and does not visibly pinch into broken shading.

### Part 3

WHEN Part 3 is implemented THE SYSTEM SHALL add icing derived from a duplicate of the donut, with organic drips and surface conformity.

- `part-03.blend` exists with objects renamed logically: donut, icing, mug.
- Icing is a top shell derived from donut geometry, not an unrelated primitive.
- Icing has irregular wavy edge and multiple varied drips.
- Modifier/order intent is represented: shrink-to-donut behavior before outward thickness and smoothing, or documented Python equivalent.
- Drips and icing contact look attached to donut surface without obvious floating or severe z-fighting.
- Organic inflation/grab-like shaping creates thicker rim/drip buildup instead of flat uniform icing.

### Part 4

WHEN Part 4 is implemented THE SYSTEM SHALL add plate, camera, render setup, base materials, and donut deformation.

- `part-04.blend` exists with plate under donut.
- Plate is modeled from circular geometry with lip/rim, Solidify/Subsurf-style smoothing, and tightened rim/bottom.
- Donut and icing are slightly deformed/lighter in the middle rather than perfectly procedural torus puffy.
- Camera frames the scene for render; `part-04.png` is rendered from camera, not viewport screenshot.
- Camera framing follows a repeatable order: composition locked first, then lens/focal length, then camera distance, then depth of field.
- Base materials exist: pink glossy icing, ceramic mug, plate, brown donut with subsurface-like warmth, and table plane.

### Part 5

WHEN Part 5 is implemented THE SYSTEM SHALL apply PBR-style material logic and UV-aware texture behavior.

- `part-05.blend` exists with material node logic for Base Color plus Normal/Roughness equivalents.
- Non-color data maps or procedural equivalents are treated as non-color numerical controls, not color inputs.
- Table material has concrete/stone-like detail and color correction/darkening.
- Plate has speckled/glazed ceramic look.
- Icing has pink glaze texture/roughness/normal detail while preserving manual pink control if needed.
- Donut has baked/scanned-style surface detail and bump/displacement-like texture without clipping badly through icing.

### Part 6

WHEN Part 6 is implemented THE SYSTEM SHALL unwrap/texture the mug and add coffee foam.

- `part-06.blend` exists with mug material texture aligned more cleanly than default cylinder UVs.
- Mug body and handle have seam-style unwrap logic: hidden vertical seam, handle separated from mug, handle cut on less visible side.
- UV or procedural mapping avoids extreme stretching on handle.
- Coffee foam object is separate from mug, created from inner rim-like disk, with raised rim/surface tension shape.
- Foam material has visible coffee/foam pattern with base/normal/roughness-like detail.
- Unneeded alpha/AO/metal behavior is disconnected or avoided if it harms the foam/material.

### Part 7

WHEN Part 7 is implemented THE SYSTEM SHALL add varied sprinkles scattered on icing with controlled distribution and discrete colors.

- `part-07.blend` exists with multiple sprinkle variants, not a single identical cylinder.
- Sprinkles are small rounded cylinders or equivalent candy pieces, with varied rotation/shape/size.
- Sprinkles sit on icing surface with reasonable offset, not buried or floating widely.
- Distribution is masked to icing top area and avoids underside placement.
- Intersections are reduced using Poisson/min-distance-like logic or documented fallback.
- Sprinkle colors use discrete ColorRamp/Object Info random equivalent, avoiding continuous rainbow gradients and over-saturated noise.

### Part 8

WHEN Part 8 is implemented THE SYSTEM SHALL produce a final cafe-style render with hierarchy, lighting, and render settings.

- `final\donut-final.blend` exists and opens in Blender background with EXIT 0.
- `final\donut-final-eevee.png` exists and visually shows a complete donut, icing, sprinkles, mug with foam, plate, table, and intentional lighting.
- Objects are parented or grouped logically: icing to donut, donut to plate, foam to mug, scene objects to table/collections.
- Lighting includes warm sun/key light, cool sky/fill light, indoor bounce/fill light, and shadow blocker/window-like sliver effect or documented equivalent.
- Eevee render settings include ray-tracing/shadow/sample improvements available in local Blender, or documented Blender 4.5 fallback.
- Camera depth of field focuses attention on donut/icing without making the product unreadable.
- Final camera setup uses the same framing order as Part 4 and is validated with a DoF visualizer or equivalent focus-distance check before render.

## テスト方針

1. `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\outputs\blender-donut-tutorial\sources\part-01.txt` through `part-08.txt` must return true.
2. Before creating each planned output path, `Test-Path` must return false or the worker must stop and ask for a collision-safe suffix.
3. Each Blender build command must exit `0` and produce the declared `.blend` and `.png`.
4. Each Part QA must use `view_image` for the rendered `.png` before PASS.
5. Each Part QA must compare the `.png` and `.blend` against that Part's checklist, not against memory or imagination.
6. Final verification must confirm eight checklist files, eight QA files, final `.blend`, final render, and build logs exist.
7. Preflight must run `blender --background --version` and a smoke render with `--python-exit-code 1`; both must return EXIT 0.
8. Each QA file must include reproducibility metadata: Blender version, render engine, resolution, samples, camera lens/location/focus distance, source part, script path, and any fallback used.

Suggested Blender environment for commands:

```powershell
$base='C:\Users\user\Desktop\ClaudeCode\vibe-base\tmp\blender-user'
$env:BLENDER_USER_CONFIG="$base\config"
$env:BLENDER_USER_SCRIPTS="$base\scripts"
$env:BLENDER_USER_DATAFILES="$base\datafiles"
& 'C:\Users\user\Desktop\ClaudeCode\vibe-base\tools\blender\blender-4.5.10-windows-x64\blender.exe' --background --python '<script>'
```

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| Tutorial は Blender 5.0、local は Blender 4.5.10 LTS | Blender version command / missing operator errors | `Scatter on Surface` と `Lattice Deform Selected` は Geometry Nodes/Python/Lattice modifier equivalent に置換し、QA に deviation を記録。ユーザーが厳密 5.0 を要求する場合は Blender 5.0 導入待ちで停止 |
| NotebookLM source の再読が抜ける | checklist に source file path と Part 番号がない | Sub A の該当 Part をやり直し |
| 見た目だけ寄せて工程を飛ばす | checklist と Blender object/modifier/material evidence が対応しない | Sub C が FAIL、Sub B は同じ Part のみ修正 |
| Blender render が重い | command timeout / render time exceeds acceptable window | 低解像度 smoke → Eevee gate → samples/resolution/procedural complexity を下げる。品質判断が必要な final のみ Cycles を検討し、理由を QA に記録 |
| PBR texture assets がローカルにない | texture file path missing | procedural texture/node equivalentsで再現し、Part 5/6 QA に「asset absenceによる equivalent」と記録 |
| 旧 approximate output と混同 | path contains old `donut-tutorial-result` | trace 配下だけを合格対象にする |
| Optional add-on 前提化 | add-on unavailable / version mismatch / Auto Run disabled | `bpy` equivalent に落とす。落とせない場合はその Part を FAIL にして停止 |
| Camera framing が再び迷走 | 同一 Part で framing FAIL 2回 / subject cropped / product unreadable | diagnostic contact sheet + camera metadata を出し、前の PASS gate に戻って camera target/lens/distance/DoF を分離して再実装 |
| 再実行でオブジェクト重複 | object count unexpectedly increases / duplicate names `.001` が増える | target collection cleanup または fresh `.blend` 出力へ切替。既存成果物は上書きせず衝突 suffix を使う |

## 受け入れ基準

WHEN execution is approved THE SYSTEM SHALL implement the tutorial strictly in source order, with one QA gate per Part.

- `Glob: outputs\blender-donut-tutorial\sources\part-*.txt → 8 件存在`
- `Test-Path: docs\ops\plans\2026-06-03-blender-donut-source-trace.md → True`
- `Glob: outputs\blender-donut-tutorial\trace\part-*\part-*-checklist.md → 8 件存在` after implementation
- `Glob: outputs\blender-donut-tutorial\trace\part-*\part-*-qa.md → 8 件存在` after implementation
- `Glob: outputs\blender-donut-tutorial\trace\part-*\part-*-build-log.* → 8 件存在` after implementation
- `Test-Path: outputs\blender-donut-tutorial\trace\final\donut-final.blend → True` after implementation
- `Test-Path: outputs\blender-donut-tutorial\trace\final\donut-final-eevee.png → True` after implementation
- Each QA file must include `PASS` or `FAIL` plus reproducibility metadata; final completion is allowed only when all eight Part QA files and final QA are `PASS`.
- If Blender 5.0-only features are unavailable in Blender 4.5.10, the QA file must explicitly list the fallback and confirm visual/functional equivalence.

## 承認後モード

default（理由: 新規ファイル多数、Blender background 実行、サブエージェント実装、Blender 5.0-only feature fallback 判断を含むため、各ゲートで承認・停止可能性を残す）
