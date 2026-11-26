#!/usr/bin/env node
// scripts/check-settings-spec.mjs
// settings.json / settings.local.json 公式仕様準拠 自動判定
// 出典: code.claude.com/docs/en/settings.md / permissions.md / configuration.md
// 関連: memory/project_settings-spec-audit-result.md
// EXIT: 0 = 全 PASS or N/A のみ / 1 = 1 件以上違反

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

const productsRepoRoot = getProductsRepoRoot();
process.chdir(productsRepoRoot);

const SECRET_PATTERN = /npg_|sb_secret_|GOCSPX-|AIzaSy|sk_test_|sk_live_|BEGIN.*PRIVATE KEY|r8_aW/;

// products/ 配下の .claude/settings.json を再帰探索（node_modules / .git 除外）
function findProductSettings(dir, results = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findProductSettings(full, results);
    else if (e.name === 'settings.json' && path.basename(dir) === '.claude') {
      results.push(path.relative(productsRepoRoot, full).replace(/\\/g, '/'));
    }
  }
  return results;
}
const settingsJsonFiles = [
  '.claude/settings.json',
  ...findProductSettings(path.join(productsRepoRoot, 'products')).sort(),
];
const settingsLocalFiles = settingsJsonFiles.map(f => f.replace('settings.json', 'settings.local.json'));

const PRODUCT_COUNT = settingsJsonFiles.length - 1;  // ルート settings.json を除いた数
const TOTAL_SETTINGS = settingsJsonFiles.length;     // ルート + 各 product

let pass = 0, fail = 0, na = 0, warn = 0;
const failures = [];
const warnings = [];

function check(id, condition, msg) {
  if (condition) { pass++; console.log(`  ✅ ${id}`); }
  else { fail++; failures.push(`${id}: ${msg}`); console.log(`  ❌ ${id}: ${msg}`); }
}

function checkWarn(id, condition, msg) {
  if (condition) { pass++; console.log(`  ✅ ${id}`); }
  else { warn++; warnings.push(`${id}: ${msg}`); console.log(`  ⚠️ ${id}: ${msg}`); }
}

function checkNA(id, reason) {
  na++;
  console.log(`  — ${id} (N/A: ${reason})`);
}

function isIgnored(filePath) {
  try {
    execSync(`git check-ignore -q "${filePath}"`, { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

console.log('=== A. gitignore 整合性 ===');

// A-1: ルート settings.local.json gitignored
check('A-1', isIgnored('.claude/settings.local.json'), 'ルート settings.local.json が tracked');

// A-2: プロダクト settings.local.json gitignored
const a2_pass = settingsLocalFiles.slice(1).filter(isIgnored).length;
check('A-2', a2_pass === PRODUCT_COUNT, `${a2_pass}/${PRODUCT_COUNT} プロダクト settings.local.json gitignored`);

// A-3: aiueo/.env.production の処理（自治憲法に文書化されているか）
const envProductionPath = 'products/aiueo/app/frontend/.env.production';
if (isIgnored(envProductionPath)) {
  check('A-3', true);
} else {
  const aiueoCM = fs.readFileSync('products/aiueo/CLAUDE.md', 'utf8');
  if (aiueoCM.includes('.env.production') && aiueoCM.includes('tracked')) {
    checkNA('A-3', 'aiueo CLAUDE.md に意図的逸脱として文書化済（VITE_PB_URL 公開可能）');
  } else {
    check('A-3', false, '.env.production tracked かつ自治憲法に文書化なし');
  }
}

// A-4: ルート settings.json git tracked
try {
  const out = execSync('git ls-files .claude/settings.json', { encoding: 'utf8' });
  check('A-4', out.trim() === '.claude/settings.json', '.claude/settings.json が tracked でない');
} catch { check('A-4', false, '.claude/settings.json が tracked でない'); }

console.log('\n=== B. settings.json の env 用途 ===');

let b12_pass = 0;
let b3_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  // env 直書き判定（参照型 ${VAR} or env 不在なら PASS）
  if (!obj.env || Object.entries(obj.env).every(([k, v]) => typeof v === 'string' && /^\$\{[^}]+\}$/.test(v))) {
    b12_pass++;
  }
  // シークレット混入判定
  const content = fs.readFileSync(f, 'utf8');
  if (!SECRET_PATTERN.test(content)) b3_pass++;
}
check('B-1', b12_pass >= 1, 'ルート settings.json env 直書き');
check('B-2', b12_pass === TOTAL_SETTINGS, `${b12_pass}/${TOTAL_SETTINGS} settings.json env 直書きなし`);
check('B-3', b3_pass === TOTAL_SETTINGS, `${b3_pass}/${TOTAL_SETTINGS} settings.json シークレット混入なし`);
checkNA('B-4', 'user level ~/.claude/settings.json はマスター手動回答（2026-05-04 PASS 確定）');

console.log('\n=== D. permissions 設計 ===');

// D-1: Bash 引数縛り deny なし（URL/host 縛りのみ検知。--flag 縛りは意図的 deny として許容）
let d1_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const denies = obj.permissions?.deny || [];
  // URL/host 縛りのみ fragile（公式警告: protocol variations / redirect / env vars で破綻）
  // --flag / -short flag 縛りは意図的禁止表現として許容（git push --force / git push -f 両方明示すれば fragile でない）
  const fragile = denies.filter(p => /^Bash\([^*\s]+\s+[^)]*(?:https?:\/\/|\/\/[a-z])/i.test(p));
  if (fragile.length === 0) d1_pass++;
}
check('D-1', d1_pass === TOTAL_SETTINGS, `${d1_pass}/${TOTAL_SETTINGS} fragile URL/host 縛りなし`);

// D-2: Bash(*) 全許可なし
let d2_pass = 0;
for (const f of settingsLocalFiles) {
  if (!fs.existsSync(f)) { d2_pass++; continue; }
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const allows = obj.permissions?.allow || [];
  if (!allows.some(p => /^Bash\(\*\)$|^Bash:\*$/.test(p))) d2_pass++;
}
check('D-2', d2_pass === TOTAL_SETTINGS, `${d2_pass}/${TOTAL_SETTINGS} settings.local.json に Bash(*) 全許可なし`);

// D-3: deprecated. F-5 で .env deny を**存在確認**する形に統合済。意図反転（deny なし→deny あり）。
checkNA('D-3', 'F-5 に統合（.env deny の存在確認は F-5 で実施）');

// D-4: bypassPermissionsMode 未設定
let d4_pass = 0;
let d4_total = 0;
for (const f of [...settingsJsonFiles, ...settingsLocalFiles]) {
  if (!fs.existsSync(f)) continue;
  d4_total++;
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!obj.permissions?.bypassPermissionsMode) d4_pass++;
}
check('D-4', d4_pass === d4_total, `${d4_pass}/${d4_total} ファイルで bypassPermissionsMode 未設定`);

checkNA('D-5', 'additionalDirectories はマスター手動回答（2026-05-04 PASS 確定: ~/.claude/settings.json 記載）');

console.log('\n=== E. マージ仕様 ===');

// E-1: propagate-hooks.mjs の deny マージが連結 union
const propagateScript = fs.readFileSync(path.join(governanceRoot, 'scripts/propagate-hooks.mjs'), 'utf8');
check('E-1', /\[\.\.\.new Set\(\[\.\.\..+,\s*\.\.\..+\]\)\]/.test(propagateScript),
       'propagate-hooks.mjs に union 結合パターンが見つからない');

// E-2: プロダクト settings.json で上位 deny 全継承
const root = JSON.parse(fs.readFileSync('.claude/settings.json', 'utf8'));
const rootDeny = new Set(root.permissions?.deny || []);
let e2_pass = 0;
for (const f of settingsJsonFiles.slice(1)) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const pDeny = new Set(obj.permissions?.deny || []);
  if ([...rootDeny].every(d => pDeny.has(d))) e2_pass++;
}
check('E-2', e2_pass === PRODUCT_COUNT, `${e2_pass}/${PRODUCT_COUNT} プロダクトで上位 deny 全継承`);

// E-3: hooks 同期先が settings.json
check('E-3', /rootSettingsJsonPath[\s\S]*hooks/.test(propagateScript),
       'propagate-hooks.mjs の hooks 同期先が settings.json でない');

console.log('\n=== F. 役割分担・防御層 ===');

// F-1: settings.json はチーム合意ルールのみ
let f1_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const keys = Object.keys(obj);
  // 公式 available-settings のトップレベルキー（permission 系以外）も許可。新公式機能追加時はここに足す（2026-06-06: showClearContextOnPlanAccept 追加）
  const allowed = ['permissions', 'hooks', 'env', 'additionalDirectories', 'showClearContextOnPlanAccept'];
  if (keys.every(k => allowed.includes(k) || k.startsWith('_'))) f1_pass++;
}
check('F-1', f1_pass === TOTAL_SETTINGS, `${f1_pass}/${TOTAL_SETTINGS} settings.json チーム合意ルールのみ`);

// F-2: settings.local.json に hooks 不在
let f2_pass = 0;
for (const f of settingsLocalFiles) {
  if (!fs.existsSync(f)) { f2_pass++; continue; }
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!obj.hooks) f2_pass++;
}
check('F-2', f2_pass === TOTAL_SETTINGS, `${f2_pass}/${TOTAL_SETTINGS} settings.local.json に hooks 不在`);

// F-3: hooks が settings.json に存在（Project 配置）
let f3_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (obj.hooks) f3_pass++;
}
check('F-3', f3_pass === TOTAL_SETTINGS, `${f3_pass}/${TOTAL_SETTINGS} settings.json に hooks 存在（Project 配置）`);

// F-4: settings.local.json allow に致命的完全 wildcard `Bash(*)` 不在（必須）
// 既存の curl / node -e / rm -rf 残骸は deny 側で防御されるため F-7 で WARN 表示
const CRITICAL_ALLOW_PATTERNS = [/^Bash\(\*\)$/, /^Bash:\*$/];
let f4_pass = 0;
let f4_total = 0;
for (const f of settingsLocalFiles) {
  if (!fs.existsSync(f)) { f4_pass++; f4_total++; continue; }
  f4_total++;
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const allows = obj.permissions?.allow || [];
  const hit = allows.some(a => CRITICAL_ALLOW_PATTERNS.some(re => re.test(a)));
  if (!hit) f4_pass++;
}
check('F-4', f4_pass === f4_total, `${f4_pass}/${f4_total} settings.local.json に Bash(*) 完全 wildcard 不在`);

// F-5: settings.json deny に必須項目（.env / .git/** / git push --force）存在
const REQUIRED_DENY = [
  /Edit\(.*\.env/,
  /Write\(.*\.env/,
  /Edit\(\.git\/\*\*\)/,
  /Write\(\.git\/\*\*\)/,
  /Bash\(git push --force/,
];
let f5_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const denies = obj.permissions?.deny || [];
  const allRequired = REQUIRED_DENY.every(re => denies.some(d => re.test(d)));
  if (allRequired) f5_pass++;
}
check('F-5', f5_pass === TOTAL_SETTINGS, `${f5_pass}/${TOTAL_SETTINGS} settings.json deny に必須項目（.env / .git/** / git push --force）存在`);

// F-6: settings.json ask に任意コード実行ゲート存在
const REQUIRED_ASK = [
  /Bash\(node -e/,
  /Bash\(node --input-type=/,
  /Bash\(npm install\s/,
];
let f6_pass = 0;
for (const f of settingsJsonFiles) {
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const asks = obj.permissions?.ask || [];
  const allRequired = REQUIRED_ASK.every(re => asks.some(a => re.test(a)));
  if (allRequired) f6_pass++;
}
check('F-6', f6_pass === TOTAL_SETTINGS, `${f6_pass}/${TOTAL_SETTINGS} settings.json ask に任意コード実行ゲート登録`);

// F-7: settings.local.json allow に危険 wildcard 残骸（curl / node -e / rm -rf）の WARN 表示
// deny 側でブロックされるため運用害なしだが、棚卸し対象として可視化
// Plan スコープ外（既存 642 件 allow 棚卸しは別タスク・fewer-permission-prompts skill 主導）
const RESIDUAL_PATTERNS = [
  /^Bash\(node -e/, /^Bash\(node --eval/, /^Bash\(node -p\s/,
  /^Bash\(node --input-type=/, /^Bash\(curl\s/, /^Bash\(rm -rf\s/,
];
let f7_files_clean = 0;
let f7_total_residual = 0;
for (const f of settingsLocalFiles) {
  if (!fs.existsSync(f)) { f7_files_clean++; continue; }
  const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
  const allows = obj.permissions?.allow || [];
  const hits = allows.filter(a => RESIDUAL_PATTERNS.some(re => re.test(a)));
  if (hits.length === 0) f7_files_clean++;
  else f7_total_residual += hits.length;
}
checkWarn('F-7', f7_files_clean === settingsLocalFiles.length,
  `${f7_total_residual} 件の危険 wildcard 残骸（curl/node -e/rm -rf）が allow に存在。deny 側で防御済だが棚卸し推奨`);

console.log(`\n=== 集計: ✅ ${pass} PASS / ❌ ${fail} FAIL / ⚠️ ${warn} WARN / — ${na} N/A ===`);

if (warn > 0) {
  console.log('\n警告項目（運用害なし・棚卸し推奨）:');
  warnings.forEach(w => console.log(`  - ${w}`));
}

if (fail > 0) {
  console.log('\n違反項目:');
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
process.exit(0);
