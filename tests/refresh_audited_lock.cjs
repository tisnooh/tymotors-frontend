// Mechanical Yarn v1 lock refresh: keep manifest/animations untouched, let Yarn
// resolve affected transitive packages within each dependency's original range.
// Run the audit first, set AUDIT_REPORT_PATH, then run yarn install + tests/build.
const fs = require('node:fs');
if (!process.env.AUDIT_REPORT_PATH) throw new Error('AUDIT_REPORT_PATH is required');
const report = JSON.parse(fs.readFileSync(process.env.AUDIT_REPORT_PATH, 'utf8'));
const names = new Set(report.advisories.filter(a => a.fixed !== '<0.0.0').map(a => a.package));
const text = fs.readFileSync('yarn.lock', 'utf8');
const blocks = text.replace(/\r\n/g, '\n').split('\n\n');
let removed = 0;
const kept = blocks.filter(block => {
  const header = block.split('\n')[0];
  const affected = [...names].some(name => header.startsWith(`${name}@`) || header.startsWith(`"${name}@`));
  if (affected) removed++;
  return !affected;
});
fs.writeFileSync('yarn.lock', kept.join('\n\n'));
console.log(JSON.stringify({ refreshedBlocks: removed }));
