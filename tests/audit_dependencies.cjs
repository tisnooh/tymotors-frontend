// Audit the committed Yarn graph against the npm advisory service; never create a second lockfile.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['--yes', 'yarn@1.22.22', 'audit', '--json'], { shell: process.platform === 'win32', encoding: 'utf8', timeout: 180000, maxBuffer: 12 * 1024 * 1024 });
const findings = new Map(); let summary;
for (const line of (result.stdout || '').split('\n')) {
  let entry; try { entry = JSON.parse(line); } catch { continue; }
  if (entry.type === 'auditSummary') summary = entry.data;
  if (entry.type === 'auditAdvisory') {
    const a = entry.data.advisory;
    const previous = findings.get(a.id);
    findings.set(a.id, { id: a.github_advisory_id || `npm:${a.id}`, package: a.module_name, severity: a.severity,
      versions: [...new Set([...(previous?.versions || []), ...a.findings.map(f => f.version)])], fixed: a.patched_versions, url: a.url });
  }
}
if (!summary || result.error || result.signal) { console.error('Audit unavailable; no clean result claimed.'); process.exit(2); }
const report = { summary, advisories: [...findings.values()] };
if (process.env.AUDIT_REPORT_PATH) fs.writeFileSync(process.env.AUDIT_REPORT_PATH, JSON.stringify(report, null, 2));
const packages = [...new Set(report.advisories.map(a => a.package))];
console.log(JSON.stringify({ summary, uniqueAdvisories: findings.size, packages }, null, 2));
if (process.argv.includes('--enforce')) {
  try {
    require('./dependency_policy.cjs').enforce(report, require('./dependency-baseline.json'));
    for (const advisory of report.advisories) console.warn(`KNOWN UNFIXED: ${advisory.id} ${advisory.package} ${advisory.severity}; exception expires 2026-11-13`);
  } catch (error) { console.error(error.message); process.exit(1); }
  process.exit(0);
}
process.exit(findings.size ? 1 : 0);
