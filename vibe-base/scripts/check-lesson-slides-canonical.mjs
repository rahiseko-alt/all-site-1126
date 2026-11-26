#!/usr/bin/env node
/**
 * check-lesson-slides-canonical.mjs
 *
 * coach lesson-slides.html の ADDRESSING 規約違反を機械検出する。
 *
 * 規約（lesson-slides.html 先頭コメント参照）:
 *   § ADDRESSING
 *   - data-i 属性は禁止（旧 41 枚時代の legacy・全削除済）
 *   - <!-- ═══ NN · X-Y ... ═══ --> の DOM 位置番号 prefix は禁止
 *   - chapter-staged の corner tr は空 div にする（hardcoded "Chapter NN" 禁止）
 *
 *   § SIZE（2026-05-16 マスター確定・1366×768 固定キャンバス）
 *   - .slide は width: 1366px / height: 768px / overflow: hidden 必須
 *   - .slide に min-height 使用禁止（内容で伸びる原因）
 *   - body に zoom: var(--fit-zoom, 1) で viewport フィット
 *   - JS で --fit-zoom = min(innerWidth/1366, innerHeight/768) を resize 連動更新
 *
 *   § LETTERBOX（2026-05-17 Session 291 v2 マスター確定・規約 v1.6）
 *   - fit-zoom 計算は Math.min(..., 1.0) でキャップ必須（拡大禁止）
 *   - html { overflow: hidden } 必須（letterbox 帯領域もスクロール禁止）
 *   - html { background: oklch(0.10 0.01 265) } 必須（letterbox 帯色は html 担当）
 *   - body { width: 1366px; height: 768px } 必須（letterbox 容器内の slide 領域）
 *   - body に height: 100vh 使用禁止（zoom で物理サイズ超過する原因）
 *   - body 直書きの letterbox 帯色設定（background: oklch(0.10 ...) 等）禁止
 *   - .rotate-recommend 要素必須 + @media (orientation: portrait) and (max-width: 480px) 必須
 *
 * 真実源は JS renumberCornerTr が生成する "NN / TOTAL"（dock counter と一致）。
 *
 * EXIT:
 *   0 = 違反ゼロ
 *   1 = 違反検出（check-in-verify.sh で NG・即時停止）
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { getProductsRepoRoot } from "./repo-paths.mjs";

// 段階 2 分割後: coach は兄弟 repo vibe-base に存在する
const TARGET = resolve(getProductsRepoRoot(), "products/coach/lesson-slides.html");

if (!existsSync(TARGET)) {
  console.log("SKIP: products/coach/lesson-slides.html 不在");
  process.exit(0);
}

const src = readFileSync(TARGET, "utf-8");

// HTML/JS コメントを除去（規約コメント内の "data-i" 等のリテラルが false positive にならないように）
const srcStripped = src
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

const violations = [];

// 1. data-i 属性検出（コメント除去版で照合）
const dataIMatches = srcStripped.match(/\sdata-i="[^"]*"/g) || [];
if (dataIMatches.length > 0) {
  violations.push({
    rule: "DATA_I_FORBIDDEN",
    count: dataIMatches.length,
    sample: dataIMatches.slice(0, 3).join(" / "),
    fix: "data-i 属性を全削除せよ。位置はソースに書かない（JS が DOM order から生成）",
  });
}

// 2. <!-- ═══ NN · ... ═══ --> 形式の DOM 位置番号 prefix 検出
const commentMatches = src.match(/<!--\s+═{3,}\s+\d+(?:-\d+)?\s+·\s+/g) || [];
if (commentMatches.length > 0) {
  violations.push({
    rule: "POSITION_NUMBER_IN_COMMENT",
    count: commentMatches.length,
    sample: commentMatches.slice(0, 3).join(" / "),
    fix: "コメントの DOM 位置番号 prefix（例: '═══ 22 · 3-5'）を削除し lesson ID のみ残せ",
  });
}

// 3. chapter-staged の hardcoded "Chapter NN" 検出（コメント除去版で照合）
const hardcodedChapterMatches = srcStripped.match(/<div class="corner tr">Chapter\s*\d+<\/div>/g) || [];
if (hardcodedChapterMatches.length > 0) {
  violations.push({
    rule: "HARDCODED_CHAPTER_IN_CORNER_TR",
    count: hardcodedChapterMatches.length,
    sample: hardcodedChapterMatches.slice(0, 3).join(" / "),
    fix: 'chapter-staged の <div class="corner tr"> は空にせよ（JS が "NN / TOTAL" を上書きする）',
  });
}

// 4. renumberCornerTr 関数の存在確認（JS 仕組みが消えていないか）
if (!/function\s+renumberCornerTr|renumberCornerTr\s*\(/.test(src)) {
  violations.push({
    rule: "RENUMBER_FUNCTION_MISSING",
    count: 1,
    sample: "renumberCornerTr IIFE 不在",
    fix: "JS の renumberCornerTr 関数を復元せよ（corner tr 動的再採番の仕組み本体）",
  });
}

// 5. ADDRESSING 規約コメントの存在確認（HTML 先頭）
if (!/ADDRESSING 規約/.test(src.slice(0, 3000))) {
  violations.push({
    rule: "ADDRESSING_DOC_COMMENT_MISSING",
    count: 1,
    sample: "HTML 先頭の ADDRESSING 規約コメント不在",
    fix: "<!DOCTYPE html> 直後の ADDRESSING 規約コメントを復元せよ",
  });
}

// 6. § SIZE 規約コメントの存在確認（HTML 先頭）
if (!/§ SIZE/.test(src.slice(0, 3000))) {
  violations.push({
    rule: "SIZE_DOC_COMMENT_MISSING",
    count: 1,
    sample: "HTML 先頭の § SIZE 規約コメント不在",
    fix: "ADDRESSING 規約コメント内に § SIZE セクションを追加せよ（1366×768 固定キャンバス規定）",
  });
}

// 7. .slide に min-height 使用禁止（内容で伸びる原因）
//    .slide セレクタ直下の min-height を検出。ただし `min-height: 0` は許容（伸ばさない reset 用途）
const slideMinHeightMatches = srcStripped.match(/\.slide\s*\{[^}]*min-height\s*:\s*([^;}]+)/g) || [];
const offendingMinHeight = slideMinHeightMatches.filter((m) => {
  const valueMatch = m.match(/min-height\s*:\s*([^;}]+)/);
  if (!valueMatch) return false;
  const value = valueMatch[1].trim();
  return value !== "0" && !/^0\s*(px|em|rem|%|vh|vw)?$/i.test(value);
});
if (offendingMinHeight.length > 0) {
  violations.push({
    rule: "SLIDE_MIN_HEIGHT_FORBIDDEN",
    count: offendingMinHeight.length,
    sample: offendingMinHeight.slice(0, 1).join(" / ").slice(0, 120) + "...",
    fix: ".slide の min-height を削除し height: 768px に置換せよ（§ SIZE 規約・min-height: 0 reset は許容）",
  });
}

// 8. .slide に width: 1366px / height: 768px / overflow: hidden 必須
const slideBlockMatch = srcStripped.match(/(?<=^|\n)\.slide\s*\{[^}]*\}/);
if (slideBlockMatch) {
  const block = slideBlockMatch[0];
  const required = [
    { prop: /width\s*:\s*1366px/, name: "width: 1366px" },
    { prop: /height\s*:\s*768px/, name: "height: 768px" },
    { prop: /overflow\s*:\s*hidden/, name: "overflow: hidden" },
  ];
  const missing = required.filter((r) => !r.prop.test(block)).map((r) => r.name);
  if (missing.length > 0) {
    violations.push({
      rule: "SLIDE_SIZE_PROPS_MISSING",
      count: missing.length,
      sample: missing.join(" / "),
      fix: `.slide に ${missing.join(" / ")} を追加せよ（§ SIZE 規約 1366×768 固定キャンバス）`,
    });
  }
}

// 9. body の zoom フィット指定確認
if (!/body\s*\{[^}]*zoom\s*:\s*var\(--fit-zoom/.test(srcStripped) &&
    !/--fit-zoom\s*:|setProperty\(['"]--fit-zoom/.test(src)) {
  violations.push({
    rule: "FIT_ZOOM_MISSING",
    count: 1,
    sample: "body zoom: var(--fit-zoom) または JS の --fit-zoom 動的更新が不在",
    fix: "body { zoom: var(--fit-zoom, 1); } + JS で min(innerWidth/1366, innerHeight/768) を resize 連動更新せよ",
  });
}

// 10. § LETTERBOX: fit-zoom 1.0 キャップ必須（拡大禁止）
//     Math.min(..., 1.0) or Math.min(..., 1) パターン検出
if (!/Math\.min\([^)]*window\.innerWidth[^)]*window\.innerHeight[^)]*,\s*1(?:\.0)?\s*\)/.test(src)) {
  violations.push({
    rule: "LETTERBOX_FIT_ZOOM_CAP_MISSING",
    count: 1,
    sample: "fit-zoom 計算式に 1.0 キャップが不在",
    fix: "Math.min(innerWidth/1366, innerHeight/768, 1.0) でキャップせよ（letterbox 思想: 拡大禁止・§3 規約 v1.6）",
  });
}

// 11. § LETTERBOX: html overflow:hidden 必須
const htmlBlocks = srcStripped.match(/(?<=^|\n|\})\s*html\s*\{[^}]*\}/g) || [];
const hasHtmlOverflowHidden = htmlBlocks.some(b => /overflow\s*:\s*hidden/.test(b));
if (!hasHtmlOverflowHidden) {
  violations.push({
    rule: "LETTERBOX_HTML_OVERFLOW_MISSING",
    count: 1,
    sample: "html { overflow: hidden } が不在",
    fix: "html { overflow: hidden; height: 100vh; width: 100vw } を設定せよ（letterbox 容器化・§3 規約 v1.6）",
  });
}

// 12. § LETTERBOX: html に letterbox 帯色設定必須
const hasHtmlLetterboxColor = htmlBlocks.some(b => /background\s*:\s*oklch\(\s*0\.1[0-5]?\s+0\.0[0-2]?[0-9]?\s+26[0-9]/.test(b));
if (!hasHtmlLetterboxColor) {
  violations.push({
    rule: "LETTERBOX_HTML_BG_MISSING",
    count: 1,
    sample: "html { background: oklch(0.10 0.01 265) } 相当の letterbox 帯色が不在",
    fix: "html { background: oklch(0.10 0.01 265) } を設定せよ（letterbox 帯色は html 担当・§3 規約 v1.6）",
  });
}

// 13. § LETTERBOX: body に height: 100vh 禁止（zoom で物理サイズ超過する原因）
const bodyBlocks = srcStripped.match(/(?<=^|\n|\})\s*body\s*\{[^}]*\}/g) || [];
const bodyHas100vh = bodyBlocks.some(b => /height\s*:\s*100vh/.test(b));
if (bodyHas100vh) {
  violations.push({
    rule: "LETTERBOX_BODY_100VH_FORBIDDEN",
    count: 1,
    sample: "body に height: 100vh が設定されている",
    fix: "body { height: 100vh } → body { height: 768px } に置換せよ（letterbox: body は 1366×768 固定・§3 規約 v1.6）",
  });
}

// 14. § LETTERBOX: body に 1366×768 寸法固定必須
const bodyHasFixedSize = bodyBlocks.some(b => /width\s*:\s*1366px/.test(b) && /height\s*:\s*768px/.test(b));
if (!bodyHasFixedSize) {
  violations.push({
    rule: "LETTERBOX_BODY_FIXED_SIZE_MISSING",
    count: 1,
    sample: "body { width: 1366px; height: 768px } 寸法固定が不在",
    fix: "body { width: 1366px; height: 768px } を設定せよ（letterbox 容器内の slide 領域・§3 規約 v1.6）",
  });
}

// 15. § LETTERBOX: body 直書きの letterbox 帯色設定禁止（帯色は html 担当）
const bodyHasLetterboxColor = bodyBlocks.some(b => /background\s*:\s*oklch\(\s*0\.1[0-5]?\s+0\.0[0-2]?[0-9]?\s+26[0-9]/.test(b));
if (bodyHasLetterboxColor) {
  violations.push({
    rule: "LETTERBOX_BODY_BG_FORBIDDEN",
    count: 1,
    sample: "body に letterbox 帯色 oklch(0.1x ...) が設定されている",
    fix: "body の background は #ffffff or var(--bg-deeper) にし、letterbox 帯色は html セレクタに移せ（§3 規約 v1.6）",
  });
}

// 16. § LETTERBOX: .rotate-recommend 要素必須（スマホ縦持ち overlay）
if (!/class=["']rotate-recommend["']/.test(src)) {
  violations.push({
    rule: "LETTERBOX_ROTATE_OVERLAY_MISSING",
    count: 1,
    sample: ".rotate-recommend 要素が不在",
    fix: '<div class="rotate-recommend"> を body 末尾に追加せよ（スマホ縦持ち overlay・§3 規約 v1.6）',
  });
}

// 17. § LETTERBOX: @media (orientation: portrait) and (max-width: 480px) 必須
if (!/@media\s*\(\s*orientation\s*:\s*portrait\s*\)\s*and\s*\(\s*max-width\s*:\s*480px\s*\)/.test(src)) {
  violations.push({
    rule: "LETTERBOX_PORTRAIT_MEDIA_MISSING",
    count: 1,
    sample: "@media (orientation: portrait) and (max-width: 480px) ルールが不在",
    fix: "スマホ縦持ち向け @media クエリで .rotate-recommend を display: flex 化せよ（§3 規約 v1.6）",
  });
}

// 結果
if (violations.length === 0) {
  console.log("OK: ADDRESSING 規約違反ゼロ");
  process.exit(0);
}

console.log(`NG: ADDRESSING 規約違反 ${violations.length} 種類検出`);
violations.forEach((v) => {
  console.log(`  - [${v.rule}] ${v.count} 件`);
  console.log(`    sample: ${v.sample}`);
  console.log(`    fix:    ${v.fix}`);
});
process.exit(1);
