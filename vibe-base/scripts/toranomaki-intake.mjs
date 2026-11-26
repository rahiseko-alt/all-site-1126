#!/usr/bin/env node
/**
 * scripts/toranomaki-intake.mjs
 *
 * HTML虎の巻 outbox 回収エンジン。
 * product セッションが `products/{product}/.toranomaki-outbox/{slug}/` に投函した
 * テーマ提出物（meta.json + concept.md + research-log.md + impl-{lib}-{ver} フォルダ）を、
 * 司令塔セッションが中央 `docs/html-toranomaki/{slug}/` へ取り込み、
 * registry.json を更新（json-canary 保護）し、公開ビルドを再生成する。
 *
 * 重要規律:
 *   - **auto-commit 禁止**: 取込結果は unstaged のまま終了する。コミットは司令塔＋マスター承認のみ。
 *   - registry 書込は scripts/_lib/json-canary.mjs 経由（fixture canary + JSON.parse 保証）。
 *   - blindtest PASS なしに registry へ portfolio 公開しない（公開ビルド汚染防止）。
 *   - **取込成功後 outbox クリア**: 提出物（gitignore 済の transient キュー）は取込成功時に
 *     outbox から削除する。canonical コピーは docs/html-toranomaki/{slug}/ に残る。
 *     これを怠ると SessionStart hook が「取込待ち」を毎回誤検知し続ける（根治）。
 *
 * outbox 構造（product 側が用意）:
 *   products/{product}/.toranomaki-outbox/{slug}/
 *     ├── meta.json          { slug,title,titleEn?,blurb,tags[],impl,portfolio,promote? }
 *     ├── concept.md
 *     ├── research-log.md
 *     └── impl-{lib}-{ver}/  index.html / css / js
 *
 * 使い方:
 *   node scripts/toranomaki-intake.mjs            本番取込（配置→blindtest→registry→build）
 *   node scripts/toranomaki-intake.mjs --dry-run  検出・配置予定・registry diff のみ（本番未変更）
 *   node scripts/toranomaki-intake.mjs --skip-blindtest  blindtest を省略（CI/オフライン用）
 *   node scripts/toranomaki-intake.mjs --keep-outbox     取込成功後も outbox を削除しない（デバッグ用）
 *
 * EXIT: 0=成功（取込0件含む）/ 1=検証 or 取込失敗
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { canaryTransform } from './_lib/json-canary.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

const PRODUCTS_DIR = path.join(VIBE_BASE_ROOT, 'products');
const TORANOMAKI_DIR = path.join(VIBE_BASE_ROOT, 'docs', 'html-toranomaki');
const REGISTRY_PATH = path.join(TORANOMAKI_DIR, 'registry.json');
const REGISTRY_FIXTURE = path.join(VIBE_BASE_ROOT, 'scripts', '_fixtures', 'registry-fixture.json');
const OUTBOX_NAME = '.toranomaki-outbox';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipBlindtest = args.includes('--skip-blindtest');
const keepOutbox = args.includes('--keep-outbox');

function log(msg) {
  process.stdout.write(`[intake] ${msg}\n`);
}
function warn(msg) {
  process.stderr.write(`[intake] WARN: ${msg}\n`);
}

// ── 単一 outbox を走査して subs へ追加 ──
function scanOutbox(outboxDir, sourceName, subs) {
  if (!fs.existsSync(outboxDir)) return;
  for (const slugEnt of fs.readdirSync(outboxDir, { withFileTypes: true })) {
    if (!slugEnt.isDirectory()) continue;
    const metaPath = path.join(outboxDir, slugEnt.name, 'meta.json');
    if (fs.existsSync(metaPath)) {
      subs.push({
        product: sourceName,
        slug: slugEnt.name,
        dir: path.join(outboxDir, slugEnt.name),
        metaPath,
      });
    }
  }
}

// ── outbox 提出物を走査（intake ソース = 各 product ＋ agent-ag）──
function findSubmissions() {
  const subs = [];
  // products/{product}/.toranomaki-outbox/
  if (fs.existsSync(PRODUCTS_DIR)) {
    for (const product of fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })) {
      if (!product.isDirectory()) continue;
      scanOutbox(path.join(PRODUCTS_DIR, product.name, OUTBOX_NAME), product.name, subs);
    }
  }
  // agent-ag/.toranomaki-outbox/（R&D 実験場の提出口。agent-ag は中央 docs/ に直接書けない）
  scanOutbox(path.join(VIBE_BASE_ROOT, 'agent-ag', OUTBOX_NAME), 'agent-ag', subs);
  // ルート .toranomaki-outbox/（司令塔自身の Add 領域。§6 直書き廃止に伴い司令塔もここ経由で commit）
  scanOutbox(path.join(VIBE_BASE_ROOT, OUTBOX_NAME), 'commander', subs);
  return subs;
}

// ── meta.json 検証 ──
function validateMeta(sub) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(sub.metaPath, 'utf-8'));
  } catch (e) {
    return { ok: false, reason: `meta.json parse 失敗: ${e.message}` };
  }
  const required = ['slug', 'title', 'blurb', 'impl', 'portfolio'];
  for (const k of required) {
    if (meta[k] === undefined || meta[k] === null || meta[k] === '') {
      return { ok: false, reason: `meta.json 必須キー欠落: ${k}` };
    }
  }
  if (meta.slug !== sub.slug) {
    return { ok: false, reason: `slug 不一致: meta=${meta.slug} dir=${sub.slug}` };
  }
  if (!/^[a-z0-9-]+$/.test(meta.slug)) {
    return { ok: false, reason: `slug は kebab-case 必須: ${meta.slug}` };
  }
  const implDir = path.join(sub.dir, meta.impl);
  if (!fs.existsSync(implDir) || !fs.existsSync(path.join(implDir, 'index.html'))) {
    return { ok: false, reason: `impl 不在 or index.html 欠落: ${meta.impl}` };
  }
  return { ok: true, meta };
}

// ── 現 registry 読込 ──
function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return { version: 1, entries: [] };
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

// ── 新 order 採番（portfolio:true で order 未指定時は max+1）──
function nextOrder(registry) {
  const orders = (registry.entries || [])
    .filter((e) => typeof e.order === 'number')
    .map((e) => e.order);
  return orders.length ? Math.max(...orders) + 1 : 1;
}

// ── meta から registry エントリを生成 ──
function buildEntry(meta, registry) {
  const existing = (registry.entries || []).find((e) => e.slug === meta.slug);
  const order =
    typeof meta.order === 'number'
      ? meta.order
      : existing && typeof existing.order === 'number'
        ? existing.order
        : meta.portfolio
          ? nextOrder(registry)
          : (existing?.order ?? nextOrder(registry));
  return {
    slug: meta.slug,
    title: meta.title,
    titleEn: meta.titleEn || meta.title,
    blurb: meta.blurb,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    impl: meta.impl,
    portfolio: meta.portfolio === true,
    order,
    codeVisible: false, // 予約フラグ。常に false（知識層秘匿）
  };
}

// ── registry upsert transform（fixture / target 両方に適用可能な純粋関数）──
function makeUpsertTransform(entry) {
  return (content) => {
    const obj = JSON.parse(content);
    obj.entries = Array.isArray(obj.entries) ? obj.entries : [];
    const idx = obj.entries.findIndex((e) => e.slug === entry.slug);
    if (idx >= 0) obj.entries[idx] = { ...obj.entries[idx], ...entry };
    else obj.entries.push(entry);
    return JSON.stringify(obj, null, 2) + '\n';
  };
}

// ── in-memory registry へ entry を反映（後続 item の nextOrder を正しく増分させる）──
// registry は loadRegistry() で1回だけ読込まれるため、ループ内で反映しないと
// portfolio:true の未指定 order が全件 max+1 に団子する（採番バグ根治）。
function reflectInMemory(registry, entry) {
  registry.entries = Array.isArray(registry.entries) ? registry.entries : [];
  const i = registry.entries.findIndex((e) => e.slug === entry.slug);
  if (i >= 0) registry.entries[i] = entry;
  else registry.entries.push(entry);
}

// ── 知識層含む theme 一式を outbox → docs へ配置（meta.json は除外）──
function placeTheme(sub, meta) {
  const destBase = path.join(TORANOMAKI_DIR, meta.slug);
  function walk(rel) {
    const absSrc = path.join(sub.dir, rel);
    for (const ent of fs.readdirSync(absSrc, { withFileTypes: true })) {
      if (rel === '.' && ent.name === 'meta.json') continue; // meta は配置しない
      const childRel = path.join(rel, ent.name);
      if (ent.isDirectory()) {
        walk(childRel);
      } else if (ent.isFile()) {
        const absDest = path.join(destBase, childRel);
        fs.mkdirSync(path.dirname(absDest), { recursive: true });
        fs.copyFileSync(path.join(sub.dir, childRel), absDest);
      }
    }
  }
  walk('.');
  return destBase;
}

// ── 取込成功した提出物を outbox から削除（hook 再検知の根治）──
// 破壊安全境界: 削除対象 sub.dir が <root>/.../{OUTBOX_NAME}/{slug} の厳密形である
// ことを必須化（万一の path 異常で outbox 外や canonical を消さない）。
// canonical コピーは docs/html-toranomaki/{slug}/ に既に配置済みのため復旧可能。
// outbox は gitignore 済の transient キューなので削除は git diff を生まない。
function clearOutboxSubmission(sub) {
  const src = sub.dir;
  const segs = src.split(path.sep);
  const inBounds =
    src.startsWith(VIBE_BASE_ROOT + path.sep) &&
    segs.includes(OUTBOX_NAME) &&
    path.basename(src) === sub.slug;
  if (!inBounds) {
    warn(`  ${sub.slug}: outbox クリア中止（境界外: ${src}）。手動確認せよ`);
    return false;
  }
  try {
    fs.rmSync(src, { recursive: true, force: true });
    log(`  outbox クリア: ${path.relative(VIBE_BASE_ROOT, src)}（取込済・canonical は docs/ に存置）`);
    return true;
  } catch (e) {
    warn(`  ${sub.slug}: outbox クリア失敗: ${e.message}（手動削除可・取込自体は成功）`);
    return false;
  }
}

function runBlindtest(slug, impl) {
  const r = spawnSync(process.execPath, [
    path.join(VIBE_BASE_ROOT, 'scripts', 'toranomaki-blindtest.mjs'),
    slug,
    impl,
  ], { encoding: 'utf-8', cwd: VIBE_BASE_ROOT, stdio: 'inherit' });
  return r.status === 0;
}

function runBuild() {
  const r = spawnSync(process.execPath, [
    path.join(VIBE_BASE_ROOT, 'scripts', 'build-portfolio.mjs'),
  ], { encoding: 'utf-8', cwd: VIBE_BASE_ROOT, stdio: 'inherit' });
  return r.status === 0;
}

// ─────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────
const submissions = findSubmissions();
log(`outbox 提出物: ${submissions.length} 件${dryRun ? '（--dry-run）' : ''}`);

if (submissions.length === 0) {
  log('取込対象なし。終了。');
  process.exit(0);
}

const registry = loadRegistry();
let failures = 0;
let placedCount = 0;

for (const sub of submissions) {
  log(`── ${sub.product} / ${sub.slug} ──`);
  const v = validateMeta(sub);
  if (!v.ok) {
    warn(`${sub.slug}: ${v.reason} → skip`);
    failures++;
    continue;
  }
  const meta = v.meta;
  const entry = buildEntry(meta, registry);
  log(`  meta OK: portfolio=${entry.portfolio} order=${entry.order} impl=${entry.impl}`);

  if (dryRun) {
    // 配置予定の列挙
    const willPlace = [];
    (function walk(rel) {
      for (const ent of fs.readdirSync(path.join(sub.dir, rel), { withFileTypes: true })) {
        if (rel === '.' && ent.name === 'meta.json') continue;
        const childRel = path.join(rel, ent.name);
        if (ent.isDirectory()) walk(childRel);
        else willPlace.push(childRel.split(path.sep).join('/'));
      }
    })('.');
    log(`  [dry] 配置予定 → docs/html-toranomaki/${meta.slug}/ (${willPlace.length} files)`);
    willPlace.forEach((f) => log(`        + ${f}`));

    // registry diff を json-canary（dryRun）で検証
    const transform = makeUpsertTransform(entry);
    try {
      await canaryTransform({
        fixture: REGISTRY_FIXTURE,
        transformFn: transform,
        targets: [REGISTRY_PATH],
        dryRun: true,
      });
      const before = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      const after = transform(before);
      const exists = registry.entries.some((e) => e.slug === entry.slug);
      log(`  [dry] registry: ${exists ? 'UPDATE' : 'INSERT'} slug=${entry.slug}（canary PASS・本番未変更）`);
      log(`        diff bytes: ${before.length} → ${after.length}`);
      reflectInMemory(registry, entry); // dry でも後続の order プレビューを連番化
    } catch (e) {
      warn(`  [dry] registry canary FAIL: ${e.message}`);
      failures++;
    }
    continue;
  }

  // ── 本番取込 ──
  // 1. 配置（commit 確定前の仮配置。blindtest FAIL なら canonical に残さず rollback する）
  const existedBefore = fs.existsSync(path.join(TORANOMAKI_DIR, meta.slug));
  const destBase = placeTheme(sub, meta);
  log(`  配置完了 → ${path.relative(VIBE_BASE_ROOT, destBase)}`);

  // 2. blindtest（Commit 判定。judged-FAIL は canonical に入れない）
  if (!skipBlindtest) {
    const pass = runBlindtest(meta.slug, meta.impl);
    if (!pass) {
      if (!existedBefore) {
        // 新規配置の FAIL は丸ごと rollback（提出元 outbox は無傷なので再投入可）。
        // 破壊操作の安全境界: destBase が TORANOMAKI_DIR 直下の当該 slug ディレクトリ厳密一致である
        // ことを必須化（万一 slug 異常で destBase が canonical 自体や外を指しても全消去しない）。
        const safeRoot = path.join(TORANOMAKI_DIR, meta.slug);
        const relDest = path.relative(VIBE_BASE_ROOT, destBase);
        if (destBase === safeRoot && destBase.startsWith(TORANOMAKI_DIR + path.sep)) {
          fs.rmSync(destBase, { recursive: true, force: true });
          warn(`  ${sub.slug}: blindtest FAIL → registry 未更新＋配置を rollback: ${relDest}（canonical に未判定物を残さない）`);
        } else {
          warn(`  ${sub.slug}: blindtest FAIL → rollback 中止（配置先が想定境界外: ${destBase}）。手動確認せよ`);
        }
      } else {
        // 既存テーマの再取込 FAIL。registry 不変で三者一致は保たれるが上書き分は残るので手動確認を促す。
        warn(`  ${sub.slug}: blindtest FAIL → registry 未更新（既存テーマ ${path.relative(VIBE_BASE_ROOT, destBase)} のため配置据置・上書き分の手動確認要）`);
      }
      failures++;
      continue;
    }
    log('  blindtest PASS');
  } else {
    log('  blindtest スキップ（--skip-blindtest）');
  }

  // 3. registry 更新（json-canary 経由）
  try {
    await canaryTransform({
      fixture: REGISTRY_FIXTURE,
      transformFn: makeUpsertTransform(entry),
      targets: [REGISTRY_PATH],
    });
    log(`  registry upsert: ${entry.slug}（json-canary 保護）`);
    reflectInMemory(registry, entry); // 後続 item の nextOrder を正しく増分
  } catch (e) {
    warn(`  registry 更新失敗: ${e.message}`);
    failures++;
    continue;
  }
  placedCount++;

  // 取込成功 → outbox 提出物をクリア（--keep-outbox 指定時は据置）
  if (!keepOutbox) clearOutboxSubmission(sub);
}

// ── build 再生成（本番・配置成功あり時のみ）──
if (!dryRun && placedCount > 0) {
  log('公開ビルド再生成...');
  if (!runBuild()) {
    warn('build-portfolio 失敗');
    failures++;
  }
}

log('');
log(`完了: 取込 ${placedCount} 件 / 失敗 ${failures} 件${dryRun ? '（dry-run・本番未変更）' : '（unstaged のまま終了・auto-commit なし）'}`);
process.exit(failures > 0 ? 1 : 0);
