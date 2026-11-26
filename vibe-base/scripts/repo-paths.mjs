#!/usr/bin/env node
// scripts/repo-paths.mjs
// vibe-base モノレポ化以降、governanceRoot と productsRepoRoot は同一（後方互換のため両 export を維持）。
// CLI:
//   node scripts/repo-paths.mjs --governance-root
//   node scripts/repo-paths.mjs --products-root
// mjs:
//   import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const governanceRoot = path.resolve(__dirname, '..');

export function getProductsRepoRoot() {
  return governanceRoot;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  const flag = process.argv[2];
  if (flag === '--governance-root' || flag === '--products-root') {
    process.stdout.write(governanceRoot + '\n');
  } else {
    process.stderr.write('Usage: node scripts/repo-paths.mjs [--governance-root|--products-root]\n');
    process.exit(1);
  }
}
