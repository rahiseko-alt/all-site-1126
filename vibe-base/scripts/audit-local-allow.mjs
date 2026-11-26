#!/usr/bin/env node
// scripts/audit-local-allow.mjs
// settings.local.json の permissions.allow を kind 別に分類し、危険系を triage 表として出力する。
//
// なぜ cleanup-settings.mjs と分けるか（Refactor-on-Write の判断記録）:
//   cleanup-settings.mjs は「重複除去 + カバー済み除去」を行い settings.local.json を **書き換える**。
//   本スクリプトは read-only で「危険系の意味的衝突」を分類・提示するのみ。責務も破壊性も異なるため統合しない。
//
// 背景: docs/audits/ops-improvement-scan-2026-07.md の E-1。
//   settings-inventory の自動 conflict 判定は文字列完全一致方式のため、
//   ワイルドカード同士の包含関係（Bash(rm:*) が Bash(rm -rf ...) を包含する）を検知できず conflict=0 件だった。
//   本スクリプトは正規表現で「意味的衝突」を拾う。
//
// 使い方:
//   node scripts/audit-local-allow.mjs            # 標準出力にサマリ（read-only）
//   node scripts/audit-local-allow.mjs --write    # docs/audits/local-allow-triage-2026-07.md を生成
//   node scripts/audit-local-allow.mjs --check    # 危険系が 1 件でも残っていれば EXIT 1
//
// EXIT: 0 = 危険系ゼロ（--check 時）/ 1 = 危険系が残存（--check 時）/ 2 = 入力エラー

import fs from 'fs';
import path from 'path';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const SETTINGS = path.join(ROOT, '.claude', 'settings.local.json');
const OUT = path.join(ROOT, 'docs', 'audits', 'local-allow-triage-2026-07.md');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const CHECK = argv.includes('--check');
const PRUNE = argv.includes('--prune');
const DRY = argv.includes('--dry-run');

// --check と --prune は相互排他（--check は読み取り専用の意図・--prune は破壊操作）
if (CHECK && PRUNE) {
  console.error('[FATAL] --check と --prune は同時指定できません。');
  process.exit(2);
}

// --limit N: 一度に削除する件数の上限（段階展開のため。既定 1 = 最初の 1 件のみ）
// 正整数以外（負数・0・NaN・小数）は拒否する。dangerous.slice(0, 負数) は末尾から数えて誤削除になるため。
const LIMIT = (() => {
  const i = argv.indexOf('--limit');
  if (i < 0) return 1;
  const raw = argv[i + 1];
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`[FATAL] --limit は 1 以上の整数を指定してください（受領: ${JSON.stringify(raw)}）。`);
    process.exit(2);
  }
  return n;
})();

/**
 * settings.local.json をアトミックに書き換える。
 * tmp へ書く → JSON.parse で検証 → rename。検証に失敗したら原本を触らない。
 * 原本は .gitignore 対象で git から復元できないため、破壊は許されない。
 */
function atomicWriteSettings(obj) {
  const tmp = `${SETTINGS}.tmp-${process.pid}`;
  const json = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(tmp, json, 'utf8');
  try {
    JSON.parse(fs.readFileSync(tmp, 'utf8'));
  } catch (e) {
    fs.unlinkSync(tmp);
    console.error(`[FATAL] tmp の JSON 検証に失敗。原本は無傷: ${e.message}`);
    process.exit(2);
  }
  fs.renameSync(tmp, SETTINGS);
}

/**
 * 危険系カテゴリ。
 *
 * 【重要】判定は規則文字列の **全文** に対して行う。先頭コマンドだけを見てはならない。
 * 監査レポート A-12/A-13 が「ループ本体・ラッパーに任意コマンドを置け、破壊検知 hook は
 * 複合コマンドを解析できないため検知不能」と明記しているとおり、危険な語は先頭に来ない。
 * 実例（いずれも先頭一致では取りこぼす）:
 *   Bash(xargs -I{} taskkill //F //PID {})
 *   Bash(powershell -Command "Remove-Item -Recurse -Force ...")
 *   Bash(sleep 30 && curl -sI ...)
 *   Bash(./.venv/Scripts/python.exe -m pip install ...)
 *   Bash(cmd.exe /c "rmdir /s /q ...")
 *
 * 1 つの規則が複数カテゴリに該当しうる（例: cmd //c "taskkill ..." は cmd かつ taskkill）。
 * カテゴリ別件数は延べ数、危険系件数は規則の実数（ユニーク）で報告する。
 */
/**
 * コマンド名の出現を拾う正規表現を組み立てる。
 * - 直前: 行頭 / 空白 / 引用符 / 括弧 / パス区切り / シェル区切り（; & |）
 * - 直後: 空白 / `:`（allow のワイルドカード記法 `rm:*`）/ `*` / `)` / 行末
 * `Bash(rm:*)` `Bash(curl:*)` のような **最も危険なワイルドカード規則**を落とさないため、
 * 直後に空白を要求してはならない。
 */
function cmdRe(name) {
  // 直後: 空白 / `:`（ワイルドカード `rm:*`）/ `*` / `)` / `.exe`（`rm.exe` 形）/ 行末
  return new RegExp(`(?:^|[\\s"'(;&|/\\\\])${name}(?=\\.exe|[\\s:*)]|$)`, 'i');
}

/**
 * 「実行される位置」に現れ、かつ引数がワイルドカード（`:*` / ` *`）または `-c` の
 * 規則だけを拾う。＝任意コード実行を許す broad allow のみを危険とする。
 *
 * 拾う:   `Bash(python:*)` / `Bash(/c/.../python.exe:*)`（パス前置）
 *         `Bash(PYTHONIOENCODING=utf-8 python *)`（環境変数前置）/ `Bash(python -c ":*)`
 * 拾わない: `Bash(where python:*)`（locator の引数。実行しない）
 *           `Bash(python3 gen_sop_html.py)` / `Bash(cd x && npx tsc --noEmit)`（引数が固定）
 *
 * locator（where / which / type）の直後は「実行位置」ではないため lookbehind で除外する。
 */
function broadCmdRe(name) {
  return new RegExp(
    `(?:^|[\\s"'(;&|/\\\\])(?<!\\b(?:where|which|type)\\s)${name}(?:\\.exe)?(?::\\*|\\s+\\*|\\s+-c\\b)`,
    'i'
  );
}

/**
 * 危険の判定基準は **Claude Code 公式の "blocked by default"**（permission-modes.md）と、
 * ④環境改善 plan E-1 が定義した分類の和集合に限定する。
 *
 * 2026-07-10 に ssh / start / schtasks / wmic / reg / netsh / certutil / bitsadmin / del /
 * bash -c / Invoke-Expression / Set-ExecutionPolicy を追加したが、いずれも公式に危険の定義が無く、
 * `where python` `schtasks /query` `npx tsc --noEmit` を危険と誤判定した（過剰反応）。
 * マスター裁定（2026-07-10）により公式定義へ差し戻し、上記は検知対象から外した。
 *
 * 追加時は「公式 permission-modes.md に blocked by default の記載があるか」を根拠に置くこと。
 * selftest に陽性・陰性を必ず 1 件ずつ足すこと。
 */
const DANGEROUS = [
  // --- 公式 + E-1 の両方 ---
  { id: 'rm',           re: cmdRe('rm'),                        why: '不可逆削除。公式 circuit breaker（rm -rf / ~）・canonical Deny 正規対象' },
  { id: 'rmdir',        re: cmdRe('rmdir'),                     why: '再帰削除（/s /q）。公式 circuit breaker（rmdir / ~）' },
  { id: 'curl',         re: cmdRe('curl'),                      why: '公式が deny 推奨。シークレット外部送出経路' },
  { id: 'wget',         re: cmdRe('wget'),                      why: '公式が deny 推奨（curl と同列）' },
  // --- 公式のみ ---
  { id: 'python',       re: broadCmdRe('python3?'),             why: '公式 auto mode が broad allow を落とす対象。任意コード実行' },
  { id: 'npx',          re: broadCmdRe('npx'),                  why: '公式 auto mode が broad allow を落とす対象。任意パッケージの取得・実行' },
  { id: 'git-destroy',  re: /\bgit\s+(?:reset\s+--hard|clean\s+-[a-z]*f|stash\s+(?:drop|clear)|restore\s+\.|checkout\s+--\s+\.|remote\s+set-url|commit\s+--amend)/i,
                                                                why: '公式 blocked by default。作業ツリー・履歴・remote の不可逆改変' },
  { id: 'gh-fork',      re: /\bgh\s+repo\s+fork\b/i,            why: '公式 blocked by default。他組織への fork / push' },
  { id: 'iac-destroy',  re: /\b(?:terraform|pulumi|cdk|terragrunt)\s+destroy\b/i,
                                                                why: '公式 blocked by default。インフラ破壊' },
  { id: 'curl-pipe-sh', re: /\bcurl\b[^|]*\|\s*(?:bash|sh)\b/i, why: '公式 blocked by default。取得したコードの直接実行' },
  // --- E-1 のみ（過去事案に基づく。現在いずれも 0 件） ---
  { id: 'cmd',          re: cmdRe('cmd'),                       why: 'シェル丸ごと許可。Bash 文字列 deny の迂回経路（E-1）' },
  { id: 'powershell',   re: cmdRe('powershell'),                why: 'シェル丸ごと許可。Bash 文字列 deny の迂回経路（E-1）' },
  { id: 'taskkill',     re: cmdRe('taskkill'),                  why: 'プロセス強制終了。事前同意規律の対象（Session 278）' },
  { id: 'pip-install',  re: /\bpip3?\s+install\b/i,             why: '任意パッケージ導入。npm install が Ask なのと非一貫（E-1）' },
  { id: 'Remove-Item',  re: /\bRemove-Item\b/i,                 why: 'rm -rf 相当の不可逆削除（E-1）' },
  { id: 'Stop-Process', re: /\bStop-Process\b/i,                why: 'プロセス強制終了。事前同意規律の対象（E-1）' },
];

/**
 * selftest: 既知の陽性・陰性を固定する。分類器が壊れたら EXIT 2 で落ちる。
 * 陽性は「先頭一致では取りこぼす実在の規則」を含む。陰性は誤検知しやすい語を含む。
 */
const SELFTEST = {
  positive: [
    ['Bash(rm:*)', 'rm'],
    ['Bash(curl:*)', 'curl'],
    ['Bash(rm -f /tmp_root_coach_claude.md)', 'rm'],
    ['Bash(rm.exe -rf C:\\temp:*)', 'rm'],                       // .exe 形（code-reviewer 指摘）
    ['Bash(xargs -I{} taskkill //F //PID {})', 'taskkill'],
    ['Bash(sleep 30 && curl -sI https://example.com)', 'curl'],
    ['Bash(powershell -Command "Remove-Item -Recurse -Force x")', 'Remove-Item'],
    ['Bash(./.venv/Scripts/python.exe -m pip install fiftyone)', 'pip-install'],
    ['Bash(pip3 install:*)', 'pip-install'],
    ['Bash(cmd.exe /c "rmdir /s /q C:\\x")', 'rmdir'],
    ['PowerShell(Stop-Process *)', 'Stop-Process'],
    // 公式 auto mode が broad allow を落とす対象（ワイルドカード / -c のみ）
    ['Bash(python -c ":*)', 'python'],
    ['Bash(python:*)', 'python'],
    ['Bash(python3:*)', 'python'],
    ['Bash(npx:*)', 'npx'],
    // パス前置・環境変数前置でも「実行位置 + ワイルドカード」なら同義（2026-07-10 の取りこぼし）
    ['Bash(/c/Users/user/AppData/Local/Microsoft/WindowsApps/python3:*)', 'python'],
    ['Bash(/c/Users/user/AppData/Local/Microsoft/WindowsApps/python.exe:*)', 'python'],
    ['Bash(PYTHONIOENCODING=utf-8 python *)', 'python'],
    // 公式 blocked by default
    ['Bash(git reset --hard:*)', 'git-destroy'],
    ['Bash(cd x && git clean -fd)', 'git-destroy'],
    ['Bash(git remote set-url origin x)', 'git-destroy'],
    ['Bash(gh repo fork:*)', 'gh-fork'],
    ['Bash(terraform destroy:*)', 'iac-destroy'],
    ['Bash(curl -s https://x.sh | bash)', 'curl-pipe-sh'],
  ],
  // 誤検知してはならないもの（公式に危険の定義が無い / 引数が固定されている）
  negative: [
    'Bash(npm run build)',
    'Bash(git rebase --continue)',
    'Bash(pip list:*)',       // pip だが install でない
    'Bash(where pip:*)',      // pip だが install でない
    'Bash(pipx:*)',           // pipx は別コマンド
    'Bash(node scripts/format.mjs)',  // node は公式に危険の定義なし
    'WebFetch(domain:curl.se)',       // WebFetch はシェル起動しない
    'mcp__serena__find_symbol',       // mcp（別途 M-6 の管轄）
    // 2026-07-10 の過剰反応で誤検知した実在規則（公式に危険の定義なし / 引数固定）
    'Bash(where python:*)',           // python の場所を表示するだけ
    'Bash(where python3:*)',
    'Bash(python3 gen_sop_html.py)',  // スクリプト固定
    'Bash(cd x && npx tsc --noEmit)', // パッケージ固定
    'Bash(schtasks /query /fo CSV)',  // 読み取り専用クエリ
    'Bash(ssh:*)',                    // 公式に危険の定義なし
    'Bash(start:*)',                  // 公式に危険の定義なし
    'Bash(wmic path:*)',              // 公式に危険の定義なし
    'Bash(xargs -I {} bash -c "echo {}")', // bash は公式に危険の定義なし
  ],
};

function selftest() {
  const fails = [];
  for (const [rule, expect] of SELFTEST.positive) {
    const c = classify(rule);
    if (c.kind !== 'dangerous' || !c.categories.includes(expect)) {
      fails.push(`陽性漏れ: ${rule} → kind=${c.kind} categories=[${c.categories}] (期待 ${expect})`);
    }
  }
  for (const rule of SELFTEST.negative) {
    const c = classify(rule);
    if (c.kind === 'dangerous') fails.push(`誤検知: ${rule} → categories=[${c.categories}]`);
  }
  if (fails.length) {
    console.error('[FATAL] selftest 失敗:');
    for (const f of fails) console.error('  ' + f);
    process.exit(2);
  }
}

/** allow 規則を { tool, inner } に分解する。例: "Bash(rm -rf x:*)" -> { tool:'Bash', inner:'rm -rf x' } */
function parseRule(rule) {
  const m = /^([A-Za-z_][\w-]*)\((.*)\)$/s.exec(rule);
  if (!m) return { tool: null, inner: rule, wildcard: false };
  const tool = m[1];
  let inner = m[2];
  // 末尾の :* / * は前方一致指定。判定対象からは外すが wildcard フラグに残す
  const wildcard = /(:\*|\s\*)$/.test(inner) || inner.endsWith('*');
  inner = inner.replace(/:\*$/, '').replace(/\s\*$/, '').trim();
  return { tool, inner, wildcard };
}

/**
 * kind を決める。dangerous > mcp > webfetch > generic-shell > onetime-shell > other
 * 危険判定は規則の **全文** を走査し、該当カテゴリを **すべて** 返す。
 */
function classify(rule) {
  const { tool, inner, wildcard } = parseRule(rule);

  // WebFetch / mcp は shell を起動しないため危険走査の対象外（誤検知防止）
  const isShell = tool === 'Bash' || tool === 'PowerShell';
  const hits = isShell ? DANGEROUS.filter((d) => d.re.test(rule)) : [];

  if (hits.length > 0) {
    return {
      kind: 'dangerous',
      categories: hits.map((h) => h.id),
      why: hits.map((h) => h.why).join(' / '),
      tool, inner, wildcard,
    };
  }
  const base = { categories: [], why: '', tool, inner, wildcard };
  if (rule.startsWith('mcp__')) return { kind: 'mcp', ...base };
  if (tool === 'WebFetch') return { kind: 'webfetch-domain', ...base };
  if (isShell) return { kind: wildcard ? 'generic-shell' : 'onetime-shell', ...base };
  return { kind: 'other', ...base };
}

function main() {
  selftest(); // 分類器が壊れていたらここで EXIT 2。偽 PASS を出さない

  let raw;
  try {
    raw = fs.readFileSync(SETTINGS, 'utf8');
  } catch {
    console.error(`[FATAL] 読めません: ${SETTINGS}`);
    process.exit(2);
  }

  let settings;
  try {
    settings = JSON.parse(raw);
  } catch (e) {
    console.error(`[FATAL] JSON パース失敗: ${e.message}`);
    process.exit(2);
  }

  const allow = settings?.permissions?.allow ?? [];
  const rows = allow.map((rule, i) => ({ i: i + 1, rule, ...classify(rule) }));

  const byKind = {};
  for (const r of rows) byKind[r.kind] = (byKind[r.kind] || 0) + 1;

  const dangerous = rows.filter((r) => r.kind === 'dangerous');
  // カテゴリ別は「延べ数」（1 規則が複数カテゴリに該当しうる）。危険系件数は規則の実数。
  const byCategory = {};
  for (const r of dangerous) for (const c of r.categories) byCategory[c] = (byCategory[c] || 0) + 1;

  // ---- サマリ（常に標準出力）----
  console.log(`対象: ${SETTINGS}`);
  console.log(`allow 総数: ${allow.length}（重複除去後: ${new Set(allow).size}）`);
  console.log('');
  console.log('kind 別内訳:');
  for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${String(v).padStart(4)}`);
  }
  console.log('');
  console.log(`危険系（意味的衝突）: ${dangerous.length} 件（規則の実数・ユニーク）`);
  console.log('カテゴリ別（延べ数・1 規則が複数該当しうる）:');
  for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(16)} ${String(v).padStart(4)}`);
  }

  // ---- triage 表の生成 ----
  if (WRITE) {
    const lines = [];
    lines.push('# local allow 危険系 triage 表（E-1）');
    lines.push('');
    lines.push(`> 生成: \`node scripts/audit-local-allow.mjs --write\`（再実行で冪等に再生成される）`);
    lines.push(`> 対象: \`.claude/settings.local.json\` の \`permissions.allow\``);
    lines.push(`> allow 総数 **${allow.length}** 件 / 危険系 **${dangerous.length}** 件（規則の実数）`);
    lines.push('>');
    lines.push('> 判定は規則の **全文走査**。先頭コマンドだけを見ると `xargs ... taskkill` `powershell -Command "Remove-Item"`');
    lines.push('> `sleep 30 && curl ...` `cmd.exe /c "rmdir /s /q ..."` を取りこぼす（監査 A-12/A-13 が指摘したラッパー経路）。');
    lines.push('');
    lines.push('## 復元手順（削除で壊した場合）');
    lines.push('');
    lines.push('```');
    lines.push('cp .claude/settings.local.json.bak-YYYYMMDD .claude/settings.local.json');
    lines.push('node -e "JSON.parse(require(\'fs\').readFileSync(\'.claude/settings.local.json\',\'utf8\'));console.log(\'ok\')"');
    lines.push('```');
    lines.push('');
    lines.push('## kind 別内訳');
    lines.push('');
    lines.push('| kind | 件数 |');
    lines.push('|---|---|');
    for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${v} |`);
    lines.push('');
    lines.push('## 危険系カテゴリ別内訳（延べ数・1 規則が複数該当しうる）');
    lines.push('');
    lines.push('| カテゴリ | 延べ件数 |');
    lines.push('|---|---|');
    for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${v} |`);
    lines.push('');
    lines.push('## 削除候補（行単位でマスター承認を得ること）');
    lines.push('');
    lines.push('| # | allow 規則 | カテゴリ | 削除理由 | 承認 |');
    lines.push('|---|---|---|---|---|');
    for (const r of dangerous) {
      const safe = r.rule.replace(/\|/g, '\\|');
      lines.push(`| ${r.i} | \`${safe}\` | ${r.categories.join(', ')} | ${r.why} | ☐ |`);
    }
    lines.push('');
    lines.push('## 削除手順（段階展開・一括削除禁止）');
    lines.push('');
    lines.push('1. `cp .claude/settings.local.json .claude/settings.local.json.bak-$(date +%Y%m%d)`');
    lines.push('2. 上表の承認欄が埋まった行のみを削除する。**最初の 1 件を削除した直後に JSON パース検証**する。');
    lines.push('3. 以降は 10 件削除ごとにパース検証する。');
    lines.push('4. 全削除後 `node scripts/audit-local-allow.mjs --check` が EXIT 0 になることを確認する。');
    lines.push('');

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
    console.log('');
    console.log(`triage 表を出力: ${OUT}`);
  }

  // ---- 段階削除（--prune）----
  if (PRUNE) {
    if (dangerous.length === 0) {
      console.log('\n[OK] 危険系 allow は 0 件です。削除するものがありません。');
      process.exit(0);
    }

    // 撤退基準 1: バックアップが無ければ絶対に削除しない（原本は git から復元できない）
    const dir = path.dirname(SETTINGS);
    const baks = fs.readdirSync(dir)
      .filter((f) => f.startsWith('settings.local.json.bak-') && !f.includes('pre-p6'));
    if (baks.length === 0) {
      console.error('\n[FATAL] バックアップ (.bak-YYYYMMDD) がありません。削除を中止します。');
      console.error('  cp .claude/settings.local.json .claude/settings.local.json.bak-$(date +%Y%m%d)');
      process.exit(2);
    }

    // 撤退基準 1b: バックアップが「直前の状態」を反映しているか新鮮さを検証する。
    // 最新 bak の mtime と allow 件数を見て、原本と乖離が大きければ古い bak を掴んでいる恐れがある。
    const freshest = baks
      .map((f) => ({ f, mt: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mt - a.mt)[0];
    let bakAllow = null;
    try {
      bakAllow = JSON.parse(fs.readFileSync(path.join(dir, freshest.f), 'utf8'))?.permissions?.allow?.length ?? null;
    } catch { /* 壊れた bak は新鮮さ判定に使わない */ }
    if (bakAllow !== null && Math.abs(bakAllow - allow.length) > Math.max(5, dangerous.length + 2)) {
      console.error(`\n[FATAL] 最新バックアップ ${freshest.f} の allow 件数 ${bakAllow} が現状 ${allow.length} と大きく乖離。`);
      console.error('  古い bak を掴んでいる恐れがあります。直前状態を反映した新しい bak を取り直してください。');
      process.exit(2);
    }

    const targets = dangerous.slice(0, LIMIT);
    const targetSet = new Set(targets.map((r) => r.rule));

    console.log('');
    console.log(`削除対象 ${targets.length} 件（残り ${dangerous.length - targets.length} 件）:`);
    for (const t of targets) console.log(`  [${t.categories.join(',')}] ${t.rule}`);

    if (DRY) {
      console.log('\n--dry-run のため書き込みませんでした。');
      process.exit(0);
    }

    const before = allow.length;
    const kept = allow.filter((r) => !targetSet.has(r));

    // 撤退基準 2: 消える集合が対象と厳密に一致すること（完全一致削除の担保）
    const removed = allow.filter((r) => targetSet.has(r));
    if (removed.length !== targets.length || kept.length !== before - targets.length) {
      console.error('\n[FATAL] 削除集合が対象と一致しません。原本を触らず中止します。');
      console.error(`  期待 ${targets.length} 件削除 / 実際 ${removed.length} 件・残 ${kept.length}（元 ${before}）`);
      process.exit(2);
    }

    settings.permissions.allow = kept;
    atomicWriteSettings(settings);

    // 撤退基準 3: 書き込み後に必ず読み直して検証する（書いた ≠ 効いている）
    const after = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
    const afterCount = after.permissions.allow.length;
    if (afterCount !== before - targets.length) {
      console.error(`\n[FATAL] 書き込み後の件数が不一致: ${afterCount}（期待 ${before - targets.length}）`);
      console.error('  即座に復元せよ: cp .claude/settings.local.json.bak-YYYYMMDD .claude/settings.local.json');
      process.exit(2);
    }
    console.log(`\n[OK] ${targets.length} 件削除。allow ${before} → ${afterCount}。JSON 検証 PASS。`);
    process.exit(0);
  }

  if (CHECK) {
    if (dangerous.length > 0) {
      console.error(`\n[NG] 危険系 allow が ${dangerous.length} 件残存しています。`);
      process.exit(1);
    }
    console.log('\n[OK] 危険系 allow は 0 件です。');
  }
  process.exit(0);
}

main();
