#!/usr/bin/env node
// Generate Codex subagent TOML mirrors from Claude Code subagent definitions.
// Source of truth: .claude/agents/*.md
// Generated output: .codex/agents/*.toml

import fs from 'fs';
import path from 'path';
import process from 'process';

const ROOT = process.cwd();
const CLAUDE_AGENTS_DIR = path.join(ROOT, '.claude', 'agents');
const CODEX_AGENTS_DIR = path.join(ROOT, '.codex', 'agents');
const CHECK_ONLY = process.argv.includes('--check');

function fail(message) {
  console.error(`NG: ${message}`);
  process.exitCode = 1;
}

function parseFrontmatter(content, filePath) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== '---') {
    throw new Error(`${filePath}: missing YAML frontmatter`);
  }

  const values = {};
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') {
      end = i;
      break;
    }
    const match = lines[i].match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) {
      values[match[1]] = match[2].trim();
    }
  }

  if (end === -1) {
    throw new Error(`${filePath}: unterminated YAML frontmatter`);
  }
  if (!values.name || !values.description) {
    throw new Error(`${filePath}: frontmatter must include name and description`);
  }

  const body = lines.slice(end + 1).join('\n').replace(/^\n/, '').trimEnd();
  return { values, body };
}

function tomlString(value) {
  return JSON.stringify(value);
}

function generatedToml({ name, description, body }, sourceRelativePath) {
  return [
    '# Generated from ' + sourceRelativePath + ' by scripts/sync-codex-agents-from-claude.mjs.',
    '# Do not edit by hand. Update the Claude Code agent definition and rerun the sync script.',
    `name = ${tomlString(name)}`,
    `description = ${tomlString(description)}`,
    `developer_instructions = ${tomlString(body)}`,
    '',
  ].join('\n');
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort();
}

if (!fs.existsSync(CLAUDE_AGENTS_DIR)) {
  fail(`Claude agents directory not found: ${CLAUDE_AGENTS_DIR}`);
  process.exit();
}

if (!CHECK_ONLY) {
  fs.mkdirSync(CODEX_AGENTS_DIR, { recursive: true });
}

const claudeFiles = listFiles(CLAUDE_AGENTS_DIR, '.md');
const expectedTomlNames = new Set();
let changed = 0;

for (const file of claudeFiles) {
  const sourcePath = path.join(CLAUDE_AGENTS_DIR, file);
  const sourceRelativePath = path.relative(ROOT, sourcePath).replace(/\\/g, '/');
  const content = fs.readFileSync(sourcePath, 'utf8');
  const { values, body } = parseFrontmatter(content, sourceRelativePath);

  const tomlName = `${values.name}.toml`;
  expectedTomlNames.add(tomlName);
  const targetPath = path.join(CODEX_AGENTS_DIR, tomlName);
  const expected = generatedToml({
    name: values.name,
    description: values.description,
    body,
  }, sourceRelativePath);
  const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : null;

  if (current !== expected) {
    changed += 1;
    if (CHECK_ONLY) {
      console.log(`DRIFT: ${path.relative(ROOT, targetPath).replace(/\\/g, '/')}`);
    } else {
      fs.writeFileSync(targetPath, expected, 'utf8');
      console.log(`SYNC: ${path.relative(ROOT, targetPath).replace(/\\/g, '/')}`);
    }
  }
}

const codexFiles = listFiles(CODEX_AGENTS_DIR, '.toml');
const extraFiles = codexFiles.filter((file) => !expectedTomlNames.has(file));
for (const file of extraFiles) {
  changed += 1;
  console.log(`EXTRA: ${path.relative(ROOT, path.join(CODEX_AGENTS_DIR, file)).replace(/\\/g, '/')}`);
}

if (CHECK_ONLY && changed > 0) {
  fail(`Codex agent mirror drift detected (${changed} file(s)). Run node scripts/sync-codex-agents-from-claude.mjs`);
} else if (changed === 0) {
  console.log(`OK: Codex agent mirrors are in sync (${claudeFiles.length} agent(s))`);
} else {
  console.log(`OK: synced ${changed} Codex agent file(s) from ${claudeFiles.length} Claude definition(s)`);
}
