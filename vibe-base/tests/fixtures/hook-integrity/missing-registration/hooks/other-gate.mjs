import { scanString } from '../scripts/check-secret-patterns.mjs';

import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const input = lines.join('\n');
  const issues = scanString(input);
  if (issues.length > 0) {
    process.stdout.write(JSON.stringify({ decision: 'block', reason: 'secret detected' }));
  } else {
    process.stdout.write(JSON.stringify({ decision: 'pass' }));
  }
});
