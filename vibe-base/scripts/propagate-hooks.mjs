#!/usr/bin/env node
// scripts/propagate-hooks.mjs
// vibe-base root の settings.json から hooks + deny を全 product settings.json に伝播する
// 公式仕様準拠: hooks は Project スコープ（settings.json = git tracked）に配置
// 旧仕様（settings.local.json 配置）からの migration ロジックも含む
// 用途: セッション開始時 or 新プロダクト作成時に実行

import fs from 'fs';
import path from 'path';
import { getProductsRepoRoot, governanceRoot } from './repo-paths.mjs';
import { ROOT_ONLY_HOOK_NAMES } from './_lib/root-only-hooks.mjs';
import { CANONICAL_ALLOW } from './_lib/canonical-allow.mjs';

// 段階 2 分割後: hooks/settings/products は兄弟 repo vibe-base に存在する
const ROOT = getProductsRepoRoot();

// ルートの settings.json から hooks + deny を読む（公式仕様準拠 Project スコープ）
const rootSettingsJsonPath = path.join(ROOT, '.claude', 'settings.json');
let rootSettings;
try {
  rootSettings = JSON.parse(fs.readFileSync(rootSettingsJsonPath, 'utf-8'));
} catch (err) {
  console.error(`ERROR: 正本 settings.json の読込に失敗しました: ${rootSettingsJsonPath}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}
const canonicalHooks = rootSettings.hooks;
const canonicalDeny = rootSettings.permissions?.deny || [];
const canonicalAsk = rootSettings.permissions?.ask || [];

if (!canonicalHooks) {
  console.error('ERROR: ルートの settings.json に hooks がありません');
  process.exit(1);
}

// root 専用 hook の定義は single source `./_lib/root-only-hooks.mjs` に集約（上の import）。
// generate-hook-manifest.mjs の SKIP_HOOKS も同モジュールを import するため、二重管理＝
// ドリフトは構造的に排除済。新規の root 専用 hook 追加はそのモジュールのみ編集すればよい。

function filterRootOnlyHooks(hooks) {
  const isRootOnly = (entry) =>
    (entry.hooks || []).some((h) =>
      ROOT_ONLY_HOOK_NAMES.some((name) => (h.command || '').includes(`--hook=${name}`))
    );
  const filtered = {};
  for (const [event, entries] of Object.entries(hooks)) {
    filtered[event] = Array.isArray(entries) ? entries.filter((e) => !isRootOnly(e)) : entries;
  }
  return filtered;
}

// 再発 guard: 子コマンド（' -- ' 以降）が /products/ を root 基準で参照する hook は
// product に伝播すると $CLAUDE_PROJECT_DIR=product で MODULE_NOT_FOUND → exit 1 を吐き続ける。
// そうした hook の --hook=<name> が ROOT_ONLY_HOOK_NAMES に登録されていなければ即停止する
// （hook 改名時に除外リストの追従を忘れて再漏洩する事故を propagate 時点で機械検知する）。
function assertRootOnlyHooksCovered(hooks) {
  const missing = [];
  for (const entries of Object.values(hooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      for (const h of entry.hooks || []) {
        const cmd = h.command || '';
        const child = cmd.includes(' -- ') ? cmd.split(' -- ').slice(1).join(' -- ') : '';
        if (!child.includes('/products/')) continue;
        const m = cmd.match(/--hook=([\w-]+)/);
        const name = m ? m[1] : null;
        if (!name || !ROOT_ONLY_HOOK_NAMES.includes(name)) {
          missing.push(name || cmd.slice(0, 80));
        }
      }
    }
  }
  if (missing.length) {
    console.error(
      'ERROR: 子コマンドが /products/ を root 基準参照する hook が ROOT_ONLY_HOOK_NAMES 未登録です: ' +
        missing.join(', ') +
        '\n  → これらは product 伝播で MODULE_NOT_FOUND を起こします。ROOT_ONLY_HOOK_NAMES に追加してください。'
    );
    process.exit(1);
  }
}
assertRootOnlyHooksCovered(canonicalHooks);

// product へ伝播する hooks（root 専用 hook を除外した版）
const productHooks = filterRootOnlyHooks(canonicalHooks);

// ─────────────────────────────────────────────────────────────
// product 固有 hook の保持: root settings.json に存在しない hook（個別 product が
// 独自に追加した hook。例: x-auto-post の queue-guard-gate / session-start-tone）は
// hooks 完全置換で消えてしまう構造的欠陥があった（2026-06-17 マスター指示の
// トンマナ機械強制が 2026-06-19 propagate 実行で無効化された事案）。
// root 由来 productHooks に、各 product の既存 settings.json から「root に無い hook 名
// だけで構成された entry」を抽出して append することで固有 hook を保持する。
// ─────────────────────────────────────────────────────────────
const rootHookNames = new Set();
for (const entries of Object.values(canonicalHooks)) {
  if (!Array.isArray(entries)) continue;
  for (const entry of entries) {
    for (const h of entry.hooks || []) {
      const m = (h.command || '').match(/--hook=([\w-]+)/);
      if (m) rootHookNames.add(m[1]);
    }
  }
}

// 既存 settings.hooks から「root に無い hook 名だけで構成された entry」を event 別に抽出。
// entry 内に root hook 名が 1 つでも混ざる場合は root 由来 entry とみなし抽出しない
// （propagate は完全置換なので固有 hook は常に独立 entry として追加される前提）。
function extractProductOwnHooks(existingHooks) {
  const own = {};
  if (!existingHooks || typeof existingHooks !== 'object') return own;
  for (const [event, entries] of Object.entries(existingHooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const names = (entry.hooks || [])
        .map((h) => {
          const m = (h.command || '').match(/--hook=([\w-]+)/);
          return m ? m[1] : null;
        })
        .filter(Boolean);
      const isOwn = names.length > 0 && names.every((n) => !rootHookNames.has(n));
      if (isOwn) {
        (own[event] = own[event] || []).push(entry);
      }
    }
  }
  return own;
}

// base（root 由来 productHooks）に own（product 固有 entry）を append。
// base の event 順を優先し、own のみの event は後ろに追加（JSON 安定化で冪等性担保）。
function mergeProductHooks(base, own) {
  const merged = {};
  const eventOrder = [...Object.keys(base), ...Object.keys(own).filter((e) => !(e in base))];
  for (const event of eventOrder) {
    const baseEntries = Array.isArray(base[event]) ? base[event] : [];
    const ownEntries = own[event] || [];
    merged[event] = [...baseEntries, ...ownEntries];
  }
  return merged;
}

// products/ 配下の settings.json を再帰的に探す（node_modules除外）
function findSettingsJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSettingsJsonFiles(full));
    } else if (entry.name === 'settings.json' && dir.endsWith('.claude')) {
      results.push(full);
    }
  }
  return results;
}

const productsDir = path.join(ROOT, 'products');
const targets = findSettingsJsonFiles(productsDir);

// モノレポ化済（旧 vibe-governance 廃止）
// 正本自身（root settings.json）は伝播対象に含めない。含めると productHooks
// （root 専用 hook を除外した版）で正本を自己上書きし、root 専用 hook が消える。
const govSettingsPath = path.join(governanceRoot, '.claude', 'settings.json');
if (
  fs.existsSync(govSettingsPath) &&
  govSettingsPath !== rootSettingsJsonPath &&
  !targets.includes(govSettingsPath)
) {
  targets.push(govSettingsPath);
}

// ─────────────────────────────────────────────────────────────
// CLAUDE.md ベース検出: 新規プロダクトに .claude/ スケルトンを自動作成
// products/<X>/CLAUDE.md があるが .claude/settings.json が無い場所を検出し、
// settings.json（hooks + deny）と settings.local.json（空 allow）を初期化
//
// 判定は「.claude/ の有無」ではなく「settings.json の有無」。
// 旧版は「.claude/ が無い」だけを拾っていたため、**.claude/settings.local.json だけを持つ
// product が両方の経路から漏れて無配備のまま放置された**（.claude/ は在るので新規作成経路に
// 入らず、settings.json が無いので同期経路の targets にも入らない）。2026-07-17 に
// check-in A-29 が実際に 4 件（google-slides-gen / instagram-auto-ops / medguide-rag /
// meishi-maker）を検知して発覚。配るか否かの本当の条件は settings.json の有無。
// ─────────────────────────────────────────────────────────────
function findProductsWithoutSettings(dir, results = []) {
  if (fs.existsSync(path.join(dir, 'CLAUDE.md'))) {
    if (!fs.existsSync(path.join(dir, '.claude', 'settings.json'))) {
      results.push(dir);
    }
    return results; // CLAUDE.md は1プロダクトに1つルール（深掘りしない）
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.claude') continue;
    if (entry.isDirectory()) {
      findProductsWithoutSettings(path.join(dir, entry.name), results);
    }
  }
  return results;
}

const newProducts = findProductsWithoutSettings(productsDir);
for (const productDir of newProducts) {
  const claudeDir = path.join(productDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });
  // settings.json: チーム共有設定（deny + hooks）
  const settingsJsonPath = path.join(claudeDir, 'settings.json');
  const settingsJson = {
    permissions: { deny: [...canonicalDeny], ask: [...canonicalAsk] },
    hooks: productHooks,
  };
  fs.writeFileSync(settingsJsonPath, JSON.stringify(settingsJson, null, 2) + '\n');
  console.log(`CREATE ${path.relative(ROOT, settingsJsonPath).replace(/\\/g, '/')}`);
  // settings.local.json: 個人ローカル（空 allow のみ）
  // **既存があれば絶対に触らない。** 検出条件が「settings.json が無い」に広がった結果、
  // settings.local.json だけを持つ product もこの経路に入る（2026-07-17）。無条件に書くと
  // マスターが積み上げたローカル allow を空で踏み潰す。ここは初期化であって同期ではない。
  const settingsLocalPath = path.join(claudeDir, 'settings.local.json');
  if (!fs.existsSync(settingsLocalPath)) {
    fs.writeFileSync(settingsLocalPath, JSON.stringify({ permissions: { allow: [] } }, null, 2) + '\n');
  }
  targets.push(settingsJsonPath);
}

// ─────────────────────────────────────────────────────────────
// プロダクト settings.json に hooks + deny を同期
// hooks: 完全置換（チーム共有の正本はルート settings.json）
// deny: 連結 union（プロダクト固有 deny を保持）
// ─────────────────────────────────────────────────────────────
let hooksUpdated = 0;
let denyUpdated = 0;
let askUpdated = 0;
for (const settingsPath of targets) {
  const rel = path.relative(ROOT, settingsPath).replace(/\\/g, '/');
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
    console.log(`SKIP ${rel}: JSON parse error`);
    continue;
  }

  let changed = false;

  // hooks 同期（root 由来 productHooks を配る + product 固有 hook を保持して append）
  const ownHooks = extractProductOwnHooks(settings.hooks);
  const targetHooks = mergeProductHooks(productHooks, ownHooks);
  if (JSON.stringify(settings.hooks) !== JSON.stringify(targetHooks)) {
    settings.hooks = targetHooks;
    changed = true;
    hooksUpdated++;
  }

  // deny 同期（連結 union、既存 deny は剥奪しない）
  const existingDeny = settings.permissions?.deny || [];
  const mergedDeny = [...new Set([...existingDeny, ...canonicalDeny])];
  if (JSON.stringify([...existingDeny].sort()) !== JSON.stringify([...mergedDeny].sort())) {
    settings.permissions = settings.permissions || {};
    settings.permissions.deny = mergedDeny;
    changed = true;
    denyUpdated++;
  }

  // ask 同期（連結 union、既存 ask は剥奪しない）
  const existingAsk = settings.permissions?.ask || [];
  const mergedAsk = [...new Set([...existingAsk, ...canonicalAsk])];
  if (JSON.stringify([...existingAsk].sort()) !== JSON.stringify([...mergedAsk].sort())) {
    settings.permissions = settings.permissions || {};
    settings.permissions.ask = mergedAsk;
    changed = true;
    askUpdated++;
  }

  if (changed) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    console.log(`SYNC ${rel}`);
  } else {
    console.log(`OK   ${rel} (already synced)`);
  }
}

// ─────────────────────────────────────────────────────────────
// allow 同期（連結 union・root 含む全 settings.json に CANONICAL_ALLOW を伝播）
// canonical-allow.mjs は root settings.json から独立した正本のため、
// hooks/deny/ask と異なり root 自身も対象に含める（自己上書きの懸念がない）。
// 既存 allow は剥奪しない（union のみ）。
// ─────────────────────────────────────────────────────────────
const allowTargets = [rootSettingsJsonPath, ...targets];
let allowUpdated = 0;
for (const settingsPath of allowTargets) {
  const rel = path.relative(ROOT, settingsPath).replace(/\\/g, '/');
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
    console.log(`SKIP ${rel}: JSON parse error (allow sync)`);
    continue;
  }
  const existingAllow = settings.permissions?.allow || [];
  const mergedAllow = [...new Set([...existingAllow, ...CANONICAL_ALLOW])];
  if (JSON.stringify([...existingAllow].sort()) !== JSON.stringify([...mergedAllow].sort())) {
    settings.permissions = settings.permissions || {};
    settings.permissions.allow = mergedAllow;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    console.log(`ALLOW-SYNC ${rel}`);
    allowUpdated++;
  }
}

// ─────────────────────────────────────────────────────────────
// Migration: プロダクト各 settings.local.json から hooks セクション削除
// 旧仕様（settings.local.json に hooks 配置）の残骸を解消
// 一度全件削除した後は冪等（hooks キー不在のため何もしない）
// ─────────────────────────────────────────────────────────────
let migrationCount = 0;
for (const settingsJsonPath of targets) {
  const settingsLocalPath = path.join(path.dirname(settingsJsonPath), 'settings.local.json');
  if (!fs.existsSync(settingsLocalPath)) continue;
  const rel = path.relative(ROOT, settingsLocalPath).replace(/\\/g, '/');
  try {
    const local = JSON.parse(fs.readFileSync(settingsLocalPath, 'utf-8'));
    if (local.hooks !== undefined) {
      delete local.hooks;
      fs.writeFileSync(settingsLocalPath, JSON.stringify(local, null, 2) + '\n');
      console.log(`MIGRATE ${rel} (hooks セクション削除)`);
      migrationCount++;
    }
  } catch {
    console.log(`SKIP ${rel}: JSON parse error`);
  }
}

// ─────────────────────────────────────────────────────────────
// hook ファイル本体配布: vibe-base/.claude/hooks/*.{sh,mjs,js} を全 product に配布
// orphan 参照（settings.json 参照あるが実体不在）を解消
// ─────────────────────────────────────────────────────────────
const rootHooksDir = path.join(ROOT, '.claude', 'hooks');
let hookFilesCopied = 0;
if (fs.existsSync(rootHooksDir)) {
  const hookFiles = fs.readdirSync(rootHooksDir).filter((f) =>
    (f.endsWith('.sh') || f.endsWith('.mjs') || f.endsWith('.js')) &&
    // root-only hook の実体は product に配らない（登録除外と対称。配ると orphan 実体が
    // 残り、再発時に常時 FAIL の温床になる）。basename から拡張子を除いて照合する。
    !ROOT_ONLY_HOOK_NAMES.includes(f.replace(/\.(sh|mjs|js)$/, ''))
  );
  for (const settingsPath of targets) {
    const productClaudeDir = path.dirname(settingsPath);
    const productHooksDir = path.join(productClaudeDir, 'hooks');
    if (!fs.existsSync(productHooksDir)) {
      fs.mkdirSync(productHooksDir, { recursive: true });
    }
    for (const hookFile of hookFiles) {
      const src = path.join(rootHooksDir, hookFile);
      const dst = path.join(productHooksDir, hookFile);
      const srcContent = fs.readFileSync(src);
      let needsCopy = true;
      if (fs.existsSync(dst)) {
        const dstContent = fs.readFileSync(dst);
        needsCopy = !srcContent.equals(dstContent);
      }
      if (needsCopy) {
        fs.writeFileSync(dst, srcContent);
        try { fs.chmodSync(dst, 0o755); } catch {}
        const rel = path.relative(ROOT, dst).replace(/\\/g, '/');
        console.log(`HOOK ${rel}`);
        hookFilesCopied++;
      }
    }
  }
}

console.log('');
console.log(`${hooksUpdated}/${targets.length} hooks updated`);
console.log(`${denyUpdated}/${targets.length} deny updated`);
console.log(`${askUpdated}/${targets.length} ask updated`);
console.log(`${allowUpdated}/${allowTargets.length} allow updated`);
console.log(`${migrationCount}/${targets.length} settings.local.json migrated (legacy hooks removed)`);
console.log(`${hookFilesCopied} hook files copied`);
