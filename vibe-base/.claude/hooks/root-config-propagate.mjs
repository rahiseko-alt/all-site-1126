#!/usr/bin/env node
/**
 * .claude/hooks/root-config-propagate.mjs  （リスト③ C-7）
 *
 * root の hook/settings 変更を各 product へ自動伝播するイベント駆動 hook。PostToolUse:Write|Edit。
 * **root 専用**（scripts/_lib/root-only-hooks.mjs 登録・products へ非伝播）。
 *
 * 発火条件: 入力 file_path が root 相対で `.claude/hooks/**` または `.claude/settings.json` の時のみ。
 *   それ以外（product の .claude/ 含む）は即 exit 0。propagate 手動 25回/月＋忘れ由来の不整合を塞ぐ。
 *
 * 実装: `node scripts/propagate-hooks.mjs` → `node scripts/generate-hook-manifest.mjs --write` を**子プロセスで**
 *   順次実行。propagate-hooks.mjs は isMain ガード不在＝import すると即副作用のため **import 禁止・spawn 限定**
 *   （failures.md 2026-06-20）。結果サマリを additionalContext で注入＝トレーサビリティ確保。
 *
 * セッション内実行のみ（PostToolUse はセッション中しか発火しない）＝「無人実行は検知のみ」原則と矛盾しない。
 * AUTOMATION_TEST=1 で spawn せず意図のみ出力（テスト用）。EXIT: 常に 0（PostToolUse をブロックしない）。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

function emit(context) {
  if (!context) return;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context } })
  );
}

function isRootConfigPath(filePath, projectDir) {
  if (!filePath) return false;
  const norm = filePath.replace(/\\/g, '/');
  const root = projectDir.replace(/\\/g, '/').replace(/\/$/, '');
  // root 相対に変換（絶対 path は root を剥がす・相対 path はそのまま）。
  // Windows のドライブレター大小差（C: と c:）で startsWith が外れ、root config 変更を「root 外」と
  // 誤判定して propagate を静かに skip するのを防ぐため、prefix 比較は小文字化して行う（slice は原文長）。
  let rel = norm;
  if (norm.toLowerCase().startsWith(root.toLowerCase() + '/')) rel = norm.slice(root.length + 1);
  else if (path.isAbsolute(norm)) return false; // root 外の絶対 path は対象外
  rel = rel.replace(/^\.\//, '');
  return rel.startsWith('.claude/hooks/') || rel === '.claude/settings.json';
}

function runChild(projectDir, args, label) {
  const res = spawnSync(process.execPath, args, { encoding: 'utf-8', cwd: projectDir });
  return {
    label,
    ok: !res.error && res.status === 0,
    status: res.error ? `spawn error: ${res.error.message}` : `exit ${res.status}`,
    stdout: res.stdout || '',
  };
}

function summarize(propagateOut) {
  // propagate-hooks.mjs の要約行を抜き出す（"X/N hooks updated" / "N hook files copied" 等）。
  const lines = propagateOut.split(/\r?\n/).filter((l) => /updated$|hook files copied$|migrated /.test(l));
  return lines.length ? lines.join(' / ') : '(summary 行なし)';
}

function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let data = '';
  process.stdin.on('data', (c) => (data += c));
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(data || '{}');
      const filePath = (input.tool_input && input.tool_input.file_path) || '';
      if (!isRootConfigPath(filePath, projectDir)) process.exit(0);

      if (process.env.AUTOMATION_TEST === '1') {
        emit(`[root-config-propagate] propagate 実行意図（TEST）: ${filePath} が root config 変更 → propagate-hooks + manifest 再生成を spawn する`);
        process.exit(0);
      }

      const prop = runChild(projectDir, [path.join('scripts', 'propagate-hooks.mjs')], 'propagate');
      const manifest = runChild(projectDir, [path.join('scripts', 'generate-hook-manifest.mjs'), '--write'], 'manifest');

      if (prop.ok && manifest.ok) {
        emit(`[root-config-propagate] root config 変更を各 product へ伝播しました: ${summarize(prop.stdout)} / manifest 再生成 OK。`);
      } else {
        const fails = [prop, manifest].filter((r) => !r.ok).map((r) => `${r.label}(${r.status})`).join(', ');
        emit(`⚠️ [root-config-propagate] 伝播に失敗: ${fails}。手動で \`node scripts/propagate-hooks.mjs && node scripts/generate-hook-manifest.mjs --write\` を実行してください。`);
      }
      process.exit(0);
    } catch (e) {
      process.stderr.write('[root-config-propagate] error: ' + (e && e.message ? e.message : String(e)) + '\n');
      process.exit(0); // PostToolUse は絶対にブロックしない
    }
  });
}

main();
