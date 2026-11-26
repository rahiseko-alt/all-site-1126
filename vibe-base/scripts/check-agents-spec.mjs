#!/usr/bin/env node
// scripts/check-agents-spec.mjs
// カスタムサブエージェント定義（.claude/agents/*.md）の YAML frontmatter 機械検証
// 用途: check-in-verify.sh A-19 として組込・毎セッション Check-in で実行
// 検証対象: 正本 ~/.claude/agents/（バックアップ vibe-base/.claude/agents/ ではない）
//
// 検証項目:
//   A-7.1: 公式フィールドのみ（公式仕様 sub-agents.md の frontmatter 全項目）
//   A-7.2: 必須フィールド存在（name / description）
//   A-7.3: name が kebab-case（小文字・数字・ハイフンのみ）
//   A-7.4: UI 専業 agent は品質基準スキルを skills プリロード必須（デザイン品質底上げ）
//   A-7.5: 検証パネル所属 agent は本文に「## 判断基準」「## 思考の癖」の両セクションが存在すること
//          （行頭アンカー ^## + linesOutsideCodeFences でフェンス``` 内の疑似見出しを除外・W4/フェンス両対策）
//   A-7.6: 実装・調査系 agent は本文に「## 完了の証拠定義」が必須（NG）・「## 思考の視点」は推奨（WARN）
//          （DoD=公式裏付けあり→NG / 視点=公式非必須→WARN の設計差。見出し検査は A-7.5 同様フェンス除外。
//           正本 docs/standards/templates/subagent-definition-checklist.md）

import fs from 'fs';
import path from 'path';
import os from 'os';

// 既定は正本 ~/.claude/agents/。テスト用に AGENTS_DIR_OVERRIDE で差し替え可能（ネガティブテスト等）。
const AGENTS_DIR = process.env.AGENTS_DIR_OVERRIDE || path.join(os.homedir(), '.claude', 'agents');

// 公式 frontmatter フィールド全件（docs/standards/templates/subagent-definition-checklist.md A 節準拠）
const ALLOWED_FIELDS = new Set([
  'name', 'description', 'tools', 'model',
  'disallowedTools', 'maxTurns', 'permissionMode',
  'skills', 'memory', 'isolation', 'background', 'effort', 'color',
]);
const REQUIRED_FIELDS = ['name', 'description'];
const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// A-7.4: UI 専業 agent は指定スキルを skills でプリロードする義務（allowlist）。
// 値: skills フィールドに含まれていなければならないスキル名。
// 対象 agent が不在の場合は WARN（FAIL 量産を避ける）。
const UI_SKILL_REQUIRED = {
  'frontend-engineer-agent': 'web-design',
};

// A-7.5: 検証パネル所属 agent の allowlist（正本: docs/standards/verification-panel.md）。
// 該当 agent の本文には「## 判断基準」「## 思考の癖」の両見出しが必須（verify-agent の
// 「癖なし」も明文化として `## 思考の癖` 見出し自体は存在させる前提）。
const VERIFICATION_PANEL = [
  'verify-agent',
  'code-reviewer',
  'security-reviewer',
  'spec-audit-agent',
  'ux-quality-reviewer',
];
const VERIFICATION_PANEL_HEADING_PATTERNS = [
  { label: '判断基準', re: /^## 判断基準/ },
  { label: '思考の癖', re: /^## 思考の癖/ },
];

// A-7.6: 実装・調査系 agent の allowlist。DoD 見出し必須（NG）・思考の視点は推奨（WARN）。
// verify系5体（A-7.5）とは判定強度が異なる: DoD は公式裏付けありのため欠落=NG、
// 思考の視点は公式非必須のため欠落=WARN（過剰 persona を強制しない設計）。
const IMPLEMENTATION_PANEL = [
  'explore-agent',
  'implement-agent',
  'backend-engineer-agent',
  'frontend-engineer-agent',
  'debugger',
  'fullstack-developer',
  'research-analyst',
];
const IMPL_DOD_RE = /^## 完了の証拠定義/;      // 欠落は NG
const IMPL_VIEWPOINT_RE = /^## 思考の視点/;     // 欠落は WARN

let ok = 0;
let warn = 0;
let ng = 0;
const seenUiAgents = new Set();
const seenPanelAgents = new Set();
const seenImplAgents = new Set();

function pass(label) { console.log(`  OK: ${label}`); ok++; }
function warning(label) { console.log(`  WARN: ${label}`); warn++; }
function fail(label) { console.log(`  NG: ${label}`); ng++; }

/**
 * ファイル内容から YAML frontmatter のトップレベルキーを抽出する簡易パーサ。
 * --- で挟まれた先頭ブロックのみを対象とし、外部ライブラリ不使用。
 * @param {string} content ファイル全文
 * @returns {{ keys: string[], values: Record<string,string> } | null} frontmatter 情報。frontmatter なしの場合は null
 */
function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0].trim() !== '---') return null;

  const keys = [];
  const values = {};
  let i = 1;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '---') break;
    // トップレベルキー: 行頭からスペースなし、`key:` の形式
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)/);
    if (m) {
      keys.push(m[1]);
      values[m[1]] = m[2].trim();
    }
    i++;
  }
  return { keys, values };
}

/**
 * 本文から「コードフェンス（``` / ~~~）の外」にある行だけを抽出する。
 * 見出し検査（A-7.5 / A-7.6）がコード例（フェンス内）の疑似見出しを本物と誤検知するのを防ぐ。
 * 返却フォーマット等の ``` ブロック内に `## ...` を書いても必須見出しとしてカウントされない。
 * （§4 横断チェック: A-7.5・A-7.6 共通の同型欠陥をここで一括是正）
 * @param {string} content ファイル全文
 * @returns {string[]} フェンス外の行の配列
 */
function linesOutsideCodeFences(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let inFence = false;
  const fenceRe = /^\s*(```|~~~)/;
  for (const line of lines) {
    if (fenceRe.test(line)) {
      inFence = !inFence; // フェンスの開閉トグル
      continue;           // フェンス行自体は見出しではない
    }
    if (!inFence) out.push(line);
  }
  return out;
}

console.log('=== カスタムサブエージェント定義検証（.claude/agents/）===\n');

// エージェントディレクトリの存在確認
if (!fs.existsSync(AGENTS_DIR)) {
  console.log(`  WARN: ${AGENTS_DIR} が存在しない。エージェント未配置（スキップ）`);
  warn++;
  console.log(`\n=== 集計 ===`);
  console.log(`  OK:   ${ok}`);
  console.log(`  WARN: ${warn}`);
  console.log(`  NG:   ${ng}`);
  console.log('\nWARN あり（進行可）');
  process.exit(0);
}

const agentFiles = fs.readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

if (agentFiles.length === 0) {
  warning('.claude/agents/ に .md ファイルが存在しない（エージェント未配置）');
} else {
  console.log(`対象: ${agentFiles.length} ファイル\n`);
}

for (const filename of agentFiles) {
  const filePath = path.join(AGENTS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const label = filename;
  let fileNg = 0;

  console.log(`--- ${label} ---`);

  const fm = parseFrontmatter(content);

  if (!fm) {
    fail(`${label}: YAML frontmatter が見つからない（--- ブロック欠落）`);
    console.log('');
    continue;
  }

  // A-7.1: 非公式フィールド検知
  const unofficial = fm.keys.filter((k) => !ALLOWED_FIELDS.has(k));
  if (unofficial.length === 0) {
    pass(`${label}: 公式フィールドのみ（${fm.keys.join(', ')}）`);
  } else {
    fail(`${label}: 非公式フィールドを検出: ${unofficial.join(', ')}（許可: ALLOWED_FIELDS 参照＝公式14フィールド）`);
    fileNg++;
  }

  // A-7.2: 必須フィールド存在
  const missing = REQUIRED_FIELDS.filter((k) => !fm.keys.includes(k));
  if (missing.length === 0) {
    pass(`${label}: 必須フィールド（name / description）あり`);
  } else {
    fail(`${label}: 必須フィールド欠落: ${missing.join(', ')}`);
    fileNg++;
  }

  // A-7.3: name が kebab-case
  const nameVal = fm.values['name'];
  if (!nameVal) {
    // A-7.2 で既に NG 報告済み（name 欠落）なのでここはスキップ
  } else if (KEBAB_CASE_RE.test(nameVal)) {
    pass(`${label}: name="${nameVal}" kebab-case OK`);
  } else {
    fail(`${label}: name="${nameVal}" が kebab-case でない（小文字・数字・ハイフンのみ許可）`);
    fileNg++;
  }

  // A-7.4: UI 専業 agent は品質基準スキルを skills でプリロード必須
  if (nameVal && Object.prototype.hasOwnProperty.call(UI_SKILL_REQUIRED, nameVal)) {
    seenUiAgents.add(nameVal);
    const requiredSkill = UI_SKILL_REQUIRED[nameVal];
    const skillsVal = fm.values['skills'] || '';
    if (skillsVal.split(/[,\s]+/).filter(Boolean).includes(requiredSkill)) {
      pass(`${label}: UI 専業 agent が skills に "${requiredSkill}" をプリロード`);
    } else {
      fail(`${label}: UI 専業 agent だが skills に "${requiredSkill}" が無い（frontmatter に \`skills: ${requiredSkill}\` を追加せよ・デザイン品質基準の到達担保）`);
      fileNg++;
    }
  }

  // A-7.5: 検証パネル所属 agent は本文に「## 判断基準」「## 思考の癖」の両見出しが必須
  if (nameVal && VERIFICATION_PANEL.includes(nameVal)) {
    seenPanelAgents.add(nameVal);
    const bodyLines = linesOutsideCodeFences(content);
    const missingHeadings = VERIFICATION_PANEL_HEADING_PATTERNS
      .filter(({ re }) => !bodyLines.some((line) => re.test(line)))
      .map(({ label: headingLabel }) => headingLabel);
    if (missingHeadings.length === 0) {
      pass(`${label}: 検証パネル所属 agent が「判断基準」「思考の癖」を本文に保有`);
    } else {
      fail(`${label}: 検証パネル所属 agent だが本文に必須見出しが無い: ${missingHeadings.join(', ')}（行頭 \`## \` で追記せよ・正本 docs/standards/verification-panel.md）`);
      fileNg++;
    }
  }

  // A-7.6: 実装・調査系 agent は本文に「## 完了の証拠定義」が必須（NG）・「## 思考の視点」は推奨（WARN）
  if (nameVal && IMPLEMENTATION_PANEL.includes(nameVal)) {
    seenImplAgents.add(nameVal);
    const bodyLines = linesOutsideCodeFences(content);
    const hasDod = bodyLines.some((line) => IMPL_DOD_RE.test(line));
    const hasViewpoint = bodyLines.some((line) => IMPL_VIEWPOINT_RE.test(line));
    if (!hasDod) {
      fail(`${label}: 実装・調査系 agent だが本文に「## 完了の証拠定義」が無い（行頭 \`## \` で追記せよ・正本 docs/standards/templates/subagent-definition-checklist.md）`);
      fileNg++;
    }
    if (!hasViewpoint) {
      warning(`${label}: 実装・調査系 agent だが本文に「## 思考の視点」が無い（推奨・行頭 \`## \` で追記せよ）`);
    }
    if (hasDod && hasViewpoint) {
      pass(`${label}: 実装・調査系 agent が「完了の証拠定義」「思考の視点」を本文に保有`);
    }
  }

  if (fileNg === 0) {
    console.log(`  => ${label} 全項目 OK`);
  }
  console.log('');
}

// A-7.4 補足: allowlist に在るが定義ファイルが見つからなかった UI 専業 agent は WARN（FAIL 量産・誤判定を避ける）
for (const uiAgent of Object.keys(UI_SKILL_REQUIRED)) {
  if (!seenUiAgents.has(uiAgent)) {
    warning(`UI 専業 agent "${uiAgent}" の定義ファイルが見つからない（allowlist と実体の乖離・リネーム/削除の可能性）`);
  }
}

// A-7.5 補足: allowlist に在るが定義ファイルが見つからなかった検証パネル agent は WARN（FAIL 量産・誤判定を避ける）
for (const panelAgent of VERIFICATION_PANEL) {
  if (!seenPanelAgents.has(panelAgent)) {
    warning(`検証パネル所属 agent "${panelAgent}" の定義ファイルが見つからない（allowlist と実体の乖離・新設予定/削除の可能性）`);
  }
}

// A-7.6 補足: allowlist に在るが定義ファイルが見つからなかった実装・調査系 agent は WARN（FAIL 量産・誤判定を避ける）
for (const implAgent of IMPLEMENTATION_PANEL) {
  if (!seenImplAgents.has(implAgent)) {
    warning(`実装・調査系 agent "${implAgent}" の定義ファイルが見つからない（allowlist と実体の乖離・新設予定/削除の可能性）`);
  }
}

// Summary
console.log(`=== 集計 ===`);
console.log(`  OK:   ${ok}`);
console.log(`  WARN: ${warn}`);
console.log(`  NG:   ${ng}`);

if (ng > 0) {
  console.log('\nNG 検知。.claude/agents/ 配下のエージェント定義を修正してください。');
  console.log('許可フィールド: ALLOWED_FIELDS 参照（公式14フィールド）');
  process.exit(1);
} else if (warn > 0) {
  console.log('\nWARN あり（進行可）');
} else {
  console.log('\n全項目 OK');
}
