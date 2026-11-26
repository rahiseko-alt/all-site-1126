#!/usr/bin/env node
/**
 * scripts/check-hook-integrity.mjs
 *
 * vibe-base hook 整合性 4 軸検査ツール
 *
 * 使い方:
 *   node scripts/check-hook-integrity.mjs
 *     → 本番 root (.claude/settings.json + .claude/hooks/ + scripts/) を検査
 *
 *   node scripts/check-hook-integrity.mjs --target-dir <path>
 *     → <path>/settings.json + <path>/hooks/ + <path>/scripts/ を検査
 *        manifest は <path>/hook-integrity-manifest.json 優先、無ければ
 *        scripts/hook-integrity-manifest.json (vibe-base root) を使用
 *
 *   node scripts/check-hook-integrity.mjs --fixture-suite <dir>
 *     → <dir>/ 配下の各サブディレクトリを --target-dir として実行し
 *        各 expected.json と照合。全件 PASS で exit 0
 *
 * 5 検査軸:
 *   (a) path 解決  : settings.json の hook command の file path が存在するか
 *   (b) dangling   : 各 hook ファイルを子プロセスで import して ERR_MODULE_NOT_FOUND 検知
 *   (c) 登録抜け   : manifest expected_hooks の各 name が settings.json に存在するか
 *   (d) 重複登録   : 同一 hook name が同一 matcher + 同一 event に複数 entry あれば失敗
 *   (e) wrapper 照合: hook-runner ラップ形式 (command 中の " -- " 区切り) で
 *                     --hook=<name> と実 hook basename が一致するか
 *
 * hook-runner ラップ形式:
 *   node "$CLAUDE_PROJECT_DIR"/.claude/hooks/hook-runner.mjs --hook=xxx -- node "$CLAUDE_PROJECT_DIR"/.claude/hooks/xxx.mjs
 *   command に " -- " が含まれる場合、最後の " -- " 以降を target command として hook path / name を抽出する。
 *
 * exit 0: 全軸 PASS / exit 1: いずれか FAIL
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// vibe-base root = scripts/ の親
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────
// 引数パース
// ─────────────────────────────────────────────
const args = process.argv.slice(2);

function getArgValue(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

const targetDirArg = getArgValue('--target-dir');
const fixtureSuiteArg = getArgValue('--fixture-suite');

// ─────────────────────────────────────────────
// fixture-suite モード
// ─────────────────────────────────────────────
if (fixtureSuiteArg) {
  runFixtureSuite(path.resolve(fixtureSuiteArg));
} else {
  const result = runIntegrityCheck(targetDirArg ? path.resolve(targetDirArg) : null);
  process.exit(result.passed ? 0 : 1);
}

// ─────────────────────────────────────────────
// fixture-suite 実行
// ─────────────────────────────────────────────
function runFixtureSuite(suiteDir) {
  if (!fs.existsSync(suiteDir)) {
    process.stderr.write(`FIXTURE SUITE ERROR: directory not found: ${suiteDir}\n`);
    process.exit(1);
  }

  const entries = fs.readdirSync(suiteDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(suiteDir, e.name))
    .sort();

  if (entries.length === 0) {
    process.stderr.write(`FIXTURE SUITE ERROR: no subdirectories in ${suiteDir}\n`);
    process.exit(1);
  }

  let allPassed = true;

  for (const fixtureDir of entries) {
    const fixtureName = path.basename(fixtureDir);
    const expectedPath = path.join(fixtureDir, 'expected.json');

    if (!fs.existsSync(expectedPath)) {
      process.stderr.write(`FIXTURE SKIP: ${fixtureName} — no expected.json\n`);
      continue;
    }

    let expected;
    try {
      expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'));
    } catch (e) {
      process.stderr.write(`FIXTURE ERROR: ${fixtureName} — failed to parse expected.json: ${e.message}\n`);
      allPassed = false;
      continue;
    }

    // 子プロセスで実行
    const result = spawnSync(
      process.execPath,
      [__filename, '--target-dir', fixtureDir],
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const actualExitCode = result.status ?? 1;
    const actualStderr = (result.stderr ?? '') + (result.output ? result.output.filter(Boolean).join('') : '');

    // exit code 照合
    const exitCodeMatch = actualExitCode === expected.exit_code;

    // stderr_contains 照合
    let stderrMatch = true;
    const missingStderr = [];
    if (expected.stderr_contains && expected.stderr_contains.length > 0) {
      for (const needle of expected.stderr_contains) {
        if (!actualStderr.includes(needle)) {
          stderrMatch = false;
          missingStderr.push(needle);
        }
      }
    }

    const passed = exitCodeMatch && stderrMatch;

    if (passed) {
      process.stdout.write(`FIXTURE PASS: ${fixtureName}\n`);
    } else {
      allPassed = false;
      process.stderr.write(`FIXTURE FAIL: ${fixtureName}\n`);
      if (!exitCodeMatch) {
        process.stderr.write(
          `  exit code: expected=${expected.exit_code} actual=${actualExitCode}\n`
        );
      }
      if (!stderrMatch) {
        process.stderr.write(
          `  stderr missing: ${missingStderr.join(', ')}\n`
        );
        process.stderr.write(`  actual stderr: ${actualStderr.trim()}\n`);
      }
    }
  }

  process.exit(allPassed ? 0 : 1);
}

// ─────────────────────────────────────────────
// メイン整合性検査
// ─────────────────────────────────────────────
function runIntegrityCheck(targetDir) {
  // target-dir が指定されていない場合は本番 root
  const isProduction = targetDir === null;

  // target-dir スタイル自動判定
  //   product style:  targetDir は product root（settings.json は <targetDir>/.claude/settings.json）
  //   fixture style:  targetDir は fixture root（settings.json は <targetDir>/settings.json）
  // $CLAUDE_PROJECT_DIR は両 style とも targetDir にマップされる
  const isProductStyle = !isProduction && fs.existsSync(path.join(targetDir, '.claude', 'settings.json'));

  // settings.json のパス
  let settingsPath;
  if (isProduction) {
    settingsPath = path.join(VIBE_BASE_ROOT, '.claude', 'settings.json');
  } else if (isProductStyle) {
    settingsPath = path.join(targetDir, '.claude', 'settings.json');
  } else {
    settingsPath = path.join(targetDir, 'settings.json');
  }

  // hooks ディレクトリ
  let hooksDir;
  if (isProduction) {
    hooksDir = path.join(VIBE_BASE_ROOT, '.claude', 'hooks');
  } else if (isProductStyle) {
    hooksDir = path.join(targetDir, '.claude', 'hooks');
  } else {
    hooksDir = path.join(targetDir, 'hooks');
  }

  // scripts ディレクトリ（dangling import のベースパス解決用）
  const scriptsDir = isProduction
    ? path.join(VIBE_BASE_ROOT, 'scripts')
    : path.join(targetDir, 'scripts');

  // manifest パス: target-dir 内優先、なければ vibe-base/scripts/ を使用
  let manifestPath;
  if (isProduction) {
    manifestPath = path.join(VIBE_BASE_ROOT, 'scripts', 'hook-integrity-manifest.json');
  } else {
    const localManifest = isProductStyle
      ? path.join(targetDir, '.claude', 'hook-integrity-manifest.json')
      : path.join(targetDir, 'hook-integrity-manifest.json');
    const fallbackManifest = path.join(VIBE_BASE_ROOT, 'scripts', 'hook-integrity-manifest.json');
    manifestPath = fs.existsSync(localManifest) ? localManifest : fallbackManifest;
  }

  let errors = [];

  // ── settings.json 読み込み ──
  if (!fs.existsSync(settingsPath)) {
    process.stderr.write(`FATAL: settings.json not found: ${settingsPath}\n`);
    return { passed: false, errors: ['settings.json not found'] };
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (e) {
    process.stderr.write(`FATAL: failed to parse settings.json: ${e.message}\n`);
    return { passed: false, errors: ['settings.json parse error'] };
  }

  // ── manifest 読み込み ──
  let manifest = { expected_hooks: [], expected_scripts: [] };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch (e) {
      process.stderr.write(`FATAL: failed to parse manifest: ${e.message}\n`);
      return { passed: false, errors: ['manifest parse error'] };
    }
  }

  // ── hooks エントリを全て収集 ──
  // 収集構造: Array of { event, matcher, command, hookFile, hookName }
  const hookEntries = [];

  const hooksSection = settings.hooks ?? {};
  for (const [event, matchers] of Object.entries(hooksSection)) {
    if (!Array.isArray(matchers)) continue;
    for (const matcherEntry of matchers) {
      const matcher = matcherEntry.matcher ?? '';
      const innerHooks = matcherEntry.hooks ?? [];
      for (const h of innerHooks) {
        if (h.type !== 'command') continue;
        const command = h.command ?? '';

        // hook-runner ラップ形式判定: command 中に " -- " があれば wrapper 形式
        // 最後の " -- " 以降を target command として扱う
        const wrapperSplit = command.split(' -- ');
        const isWrapped = wrapperSplit.length > 1;
        const targetCmd = isWrapped ? wrapperSplit[wrapperSplit.length - 1] : command;

        // target command から node 引数の file path を抽出
        // パターン例: node "$CLAUDE_PROJECT_DIR"/.claude/hooks/xxx.mjs
        //             bash "$CLAUDE_PROJECT_DIR"/.claude/hooks/xxx.sh
        const nodeMatch = targetCmd.match(/node\s+"?\$CLAUDE_PROJECT_DIR"?[/\\](.+\.mjs)/);
        if (!nodeMatch) continue; // bash/.sh/.js は対象外（.mjs のみ）

        const relativePath = nodeMatch[1]; // e.g. ".claude/hooks/secret-write-gate.mjs"
        const hookBasename = path.basename(relativePath); // e.g. "secret-write-gate.mjs"
        const hookName = hookBasename.replace(/\.mjs$/, ''); // e.g. "secret-write-gate"

        // wrapped 形式の場合は --hook=<name> と実 hook basename の照合
        // 一致しない場合は wrapperMismatch に記録 → 後段 (e) 検査で error 追加
        let wrapperMismatch = null;
        if (isWrapped) {
          const wrapperPart = wrapperSplit.slice(0, -1).join(' -- ');
          const hookFlagMatch = wrapperPart.match(/--hook=(\S+)/);
          if (hookFlagMatch) {
            const declaredName = hookFlagMatch[1];
            if (declaredName !== hookName) {
              wrapperMismatch = `--hook=${declaredName} mismatch with actual ${hookName} (matcher: ${matcher}, event: ${event})`;
            }
          } else {
            wrapperMismatch = `wrapped command missing --hook=<name> flag (matcher: ${matcher}, event: ${event}, hook: ${hookName})`;
          }
        }

        // 実際のファイルパスを target-dir 基準で解決
        // 本番: $CLAUDE_PROJECT_DIR = vibe-base root → vibe-base/.claude/hooks/xxx.mjs
        // fixture: $CLAUDE_PROJECT_DIR = targetDir → <targetDir>/hooks/xxx.mjs
        let resolvedHookPath;
        if (isProduction) {
          resolvedHookPath = path.join(VIBE_BASE_ROOT, relativePath);
        } else {
          // fixture の場合、$CLAUDE_PROJECT_DIR = targetDir として解決
          // relativePath が ".claude/hooks/xxx.mjs" や "hooks/xxx.mjs" 等の場合を考慮
          // fixture settings.json は "node \"$CLAUDE_PROJECT_DIR\"/hooks/xxx.mjs" 形式
          // nodeMatch[1] は ".claude/hooks/xxx.mjs" or "hooks/xxx.mjs"
          resolvedHookPath = path.join(targetDir, relativePath);
        }

        hookEntries.push({
          event,
          matcher,
          command,
          resolvedHookPath,
          hookBasename,
          hookName,
          isWrapped,
          wrapperMismatch,
        });
      }
    }
  }

  // ─────────────────────────────────────────────
  // (a) path 解決検査
  // ─────────────────────────────────────────────
  for (const entry of hookEntries) {
    if (!fs.existsSync(entry.resolvedHookPath)) {
      const msg = `MISSING HOOK FILE: ${entry.hookBasename} at ${entry.resolvedHookPath}`;
      process.stderr.write(msg + '\n');
      errors.push(msg);
    }
  }

  // ─────────────────────────────────────────────
  // (b) dangling import 検査（存在するファイルのみ対象）
  // ─────────────────────────────────────────────
  const existingHookPaths = [...new Set(
    hookEntries
      .filter(e => fs.existsSync(e.resolvedHookPath))
      .map(e => e.resolvedHookPath)
  )];

  for (const hookPath of existingHookPaths) {
    // 子プロセスで import を試行
    // Windows では絶対パスを file:// URL に変換する必要がある
    const hookFileUrl = pathToFileURL(hookPath).href;
    const importScript = `import(${JSON.stringify(hookFileUrl)}).catch(e=>{process.stderr.write(e.message);process.exit(1)})`;
    const result = spawnSync(
      process.execPath,
      ['-e', importScript],
      {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
        // hook が stdin を待つと hang するので stdin を空にする
        input: '',
      }
    );

    if (result.status !== 0) {
      const stderrMsg = (result.stderr ?? '').trim();
      // 真の module 解決エラーのみを (b) の対象とする。
      // fail-closed hook (secret-write-gate 等) は空 stdin で JSON.parse 失敗 → 非0 exit するが
      // これは dangling import ではないので flag しない (test 入力起因の偽陽性回避)。
      const isModuleError = /ERR_MODULE_NOT_FOUND|Cannot find module|Cannot find package|ERR_UNSUPPORTED_DIR_IMPORT|ERR_INVALID_MODULE/.test(stderrMsg);
      if (isModuleError) {
        const msg = `ERR_MODULE_NOT_FOUND: ${path.basename(hookPath)} imports nonexistent module — ${stderrMsg}`;
        process.stderr.write(msg + '\n');
        errors.push(msg);
      }
    }
  }

  // ─────────────────────────────────────────────
  // (c) 登録抜け検査
  // ─────────────────────────────────────────────
  // manifest の expected_hooks 各 name が settings.json の hookEntries に含まれるか
  const registeredNames = new Set(hookEntries.map(e => e.hookName));

  for (const expected of (manifest.expected_hooks ?? [])) {
    const expectedName = expected.name;
    if (!registeredNames.has(expectedName)) {
      // matcher_pattern と event で絞った中に name が含まれるかも確認
      const msg = `missing registration: ${expectedName} expected in matcher ${expected.matcher_pattern ?? '(any)'}`;
      process.stderr.write(msg + '\n');
      errors.push(msg);
    }
  }

  // ─────────────────────────────────────────────
  // (d) 重複登録検査
  // ─────────────────────────────────────────────
  // 同一 hookName + 同一 matcher + 同一 event に複数 entry → 失敗
  const seen = new Map(); // key: "event:matcher:hookName" → count

  for (const entry of hookEntries) {
    const key = `${entry.event}:${entry.matcher}:${entry.hookName}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  for (const [key, count] of seen) {
    if (count > 1) {
      const [event, matcher, hookName] = key.split(':');
      const msg = `duplicate registration: ${hookName} in matcher ${matcher} (event: ${event}, count: ${count})`;
      process.stderr.write(msg + '\n');
      errors.push(msg);
    }
  }

  // ─────────────────────────────────────────────
  // (e) wrapper 照合検査
  // ─────────────────────────────────────────────
  // hook-runner ラップ形式 (command 中の " -- " 区切り) で
  // --hook=<name> と実 hook basename が一致しない or --hook フラグ欠落
  for (const entry of hookEntries) {
    if (entry.wrapperMismatch) {
      const msg = `hook-runner wrapper mismatch: ${entry.wrapperMismatch}`;
      process.stderr.write(msg + '\n');
      errors.push(msg);
    }
  }

  // ─────────────────────────────────────────────
  // 結果
  // ─────────────────────────────────────────────
  if (errors.length === 0) {
    process.stdout.write('hook integrity check PASSED\n');
    return { passed: true, errors: [] };
  } else {
    process.stderr.write(`hook integrity check FAILED (${errors.length} error(s))\n`);
    return { passed: false, errors };
  }
}
