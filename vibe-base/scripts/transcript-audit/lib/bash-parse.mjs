import fs from 'node:fs';
import path from 'node:path';
import { SETTINGS_PATHS } from './config.mjs';
import { log, warn } from './utils.mjs';

export function isHookCommand(cmd) {
  return (
    cmd.indexOf('hook-runner.mjs') !== -1 ||
    cmd.indexOf('serena-hooks') !== -1 ||
    cmd.indexOf('check-in-verify') !== -1
  );
}

export function splitBashCommand(cmd) {
  const parts = [];
  let current = '';
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd.charAt(i);
    const next = i + 1 < cmd.length ? cmd.charAt(i + 1) : '';
    if (c === '&' && next === '&') {
      parts.push(current);
      current = '';
      i++;
      continue;
    }
    if (c === ';') {
      parts.push(current);
      current = '';
      continue;
    }
    if (c === '|') {
      if (next === '|') i++;
      parts.push(current);
      current = '';
      continue;
    }
    current += c;
  }
  parts.push(current);
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function splitWhitespace(s) {
  const tab = String.fromCharCode(9);
  const unified = s.split(tab).join(' ');
  return unified
    .split(' ')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function stripQuotes(tok) {
  if (tok.length >= 2) {
    const f = tok.charAt(0);
    const l = tok.charAt(tok.length - 1);
    if ((f === '"' && l === '"') || (f === "'" && l === "'")) {
      return tok.slice(1, -1);
    }
  }
  return tok;
}

export function basenameIfPath(tok) {
  const bs = String.fromCharCode(92);
  if (tok.indexOf('/') === -1 && tok.indexOf(bs) === -1) return tok;
  const unified = tok.split(bs).join('/');
  const parts = unified.split('/');
  return parts[parts.length - 1] || tok;
}

export function normalizeBashHead(segment) {
  const trimmed = segment.trim();
  if (!trimmed) return null;
  const tokens = splitWhitespace(trimmed);
  if (tokens.length === 0) return null;
  let first = stripQuotes(tokens[0]);
  if (first === 'cd') return { isCd: true };
  first = basenameIfPath(first);
  if (first === 'node' && tokens[1] && tokens[1].charAt(0) !== '-') {
    const second = basenameIfPath(stripQuotes(tokens[1]));
    return { isCd: false, key: 'node ' + second };
  }
  return { isCd: false, key: first };
}

export function bashRuleMatches(rulePattern, command) {
  const cmd = command.trim();
  if (rulePattern.endsWith(':*')) {
    const prefix = rulePattern.slice(0, -2);
    return cmd.startsWith(prefix);
  }
  if (rulePattern.endsWith(' *')) {
    const prefixStr = rulePattern.slice(0, -2);
    const prefixTokens = splitWhitespace(prefixStr);
    const cmdTokens = splitWhitespace(cmd);
    if (cmdTokens.length < prefixTokens.length) return false;
    for (let i = 0; i < prefixTokens.length; i++) {
      if (cmdTokens[i] !== prefixTokens[i]) return false;
    }
    return true;
  }
  if (rulePattern.endsWith('*')) {
    const prefix = rulePattern.slice(0, -1);
    return cmd.startsWith(prefix);
  }
  return cmd === rulePattern;
}

export function isCommandAllowed(command, rules) {
  for (const rule of rules) {
    if (bashRuleMatches(rule, command)) return true;
  }
  return false;
}

export function parseBashRule(r) {
  const prefix = 'Bash(';
  if (r.indexOf(prefix) === 0 && r.charAt(r.length - 1) === ')') {
    return r.slice(prefix.length, -1);
  }
  return null;
}

export function extractBashAllowRules(settingsObjArray) {
  const rules = new Set();
  for (const s of settingsObjArray) {
    const allow =
      s && s.permissions && Array.isArray(s.permissions.allow) ? s.permissions.allow : [];
    for (const r of allow) {
      const inner = parseBashRule(r);
      if (inner !== null) rules.add(inner);
    }
  }
  return [...rules];
}

export function loadSettingsAllowRules() {
  const objs = [];
  for (const p of SETTINGS_PATHS) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      objs.push(JSON.parse(raw));
    } catch (e) {
      warn('WARN: could not read/parse settings file ' + path.basename(p) + ': ' + e.message);
    }
  }
  return extractBashAllowRules(objs);
}

export function runSelfTest() {
  const tests = [
    {
      name: 'git-status-short-matches-git-status-colon-star',
      rules: ['git status:*'],
      cmd: 'git status --short',
      expect: true,
    },
    {
      name: 'node-eval-matches-node-colon-star-allow-only',
      rules: ['node:*'],
      cmd: 'node -e "test"',
      expect: true,
    },
    {
      name: 'rm-rf-no-matching-allow-rule',
      rules: ['git status:*', 'node:*'],
      cmd: 'rm -rf foo',
      expect: false,
    },
  ];
  let allPass = true;
  for (const t of tests) {
    const result = isCommandAllowed(t.cmd, t.rules);
    const pass = result === t.expect;
    if (!pass) allPass = false;
    const line = 'SELFTEST ' + t.name + ': ' + (pass ? 'PASS' : 'FAIL') + ' (expected=' + t.expect + ' got=' + result + ')';
    log(line);
  }
  log(allPass ? 'SELFTEST OVERALL: PASS' : 'SELFTEST OVERALL: FAIL');
  process.exit(allPass ? 0 : 1);
}
