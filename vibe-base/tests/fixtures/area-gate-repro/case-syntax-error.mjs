#!/usr/bin/env node
// SAFE REPRODUCTION FIXTURE — DO NOT USE IN PRODUCTION
// This reproduces the literal-newline SyntaxError from commit 241547c
// The string below intentionally contains a literal newline inside a single-quoted string
// which causes Node.js SyntaxError: Invalid or unexpected token

// NOTE: The actual broken code looked like:
//   return 'first line\n  2. second line\n
//     3. third line\n\n詳細: docs/ops/research-bank-sop.md';
// The newline before "  3." was a REAL newline, not the escape sequence \n

// To safely demonstrate the error pattern without executing broken code,
// here is the equivalent structure that node --check will reject:
const BROKEN_PATTERN_COMMENT = `
  In commit 241547c, the string literal was:
    return 'line1\n  line2\n
  line3';
  The line break between \n and line3 is a literal newline.
  Single-quoted strings cannot span multiple lines in JS.
  This causes: SyntaxError: Invalid or unexpected token
  Node exits with code 1, which hook-runner passes through as exit_code:1.
`;

// The fixture itself is syntactically VALID (this is just documentation).
// Use it to verify that node --check on a valid file returns exit 0.
process.stdout.write(JSON.stringify({ fixture: 'syntax-error-repro', status: 'safe-valid' }) + '\n');
process.exit(0);
