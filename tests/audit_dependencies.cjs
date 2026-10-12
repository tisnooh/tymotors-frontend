// Audit the committed Yarn graph against the npm advisory service; never create a second lockfile.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['--yes', 'yarn@1.22.22', 'audit', '--json'], { shell: process.platform === 'win32', encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 });
const findings = new Map(); let summary;
for (const line of (result.stdout || '').split('\n')) {
  let entry; try { entry = JSON.parse(line); } catch { continue; }
  if (entry.type === 'auditSummary') summary = entry.data;
  if (entry.type === 'auditAdvisory') {
    const a = entry.data.advisory;
    findings.set(a.id, { id: a.github_advisory_id, package: a.module_name, severity: a.severity,
      versions: a.findings.map(f => f.version), fixed: a.patched_versions, url: a.url });
  }
}
if (!summary) { console.error('Audit unavailable; no clean result claimed.'); process.exit(2); }
const report = { summary, advisories: [...findings.values()] };
if (process.env.AUDIT_REPORT_PATH) fs.writeFileSync(process.env.AUDIT_REPORT_PATH, JSON.stringify(report, null, 2));
const packages = [...new Set(report.advisories.map(a => a.package))];
console.log(JSON.stringify({ summary, uniqueAdvisories: findings.size, packages }, null, 2));
process.exit(findings.size ? 1 : 0);
