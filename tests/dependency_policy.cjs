const sameValues = (left, right) => JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort());

// This is an expiring, visible exception, not an audit suppression. New IDs,
// versions, severity changes, critical issues and unavailable audits fail CI.
function enforce(report, baseline, now = Date.now()) {
  if (!report.summary || !Array.isArray(report.advisories)) throw new Error('Audit result unavailable');
  if (!report.advisories.length && Object.values(report.summary.vulnerabilities).some((count) => count > 0)) {
    throw new Error('Incomplete advisory report');
  }
  for (const finding of report.advisories) {
    const exception = baseline.exceptions.find((entry) => entry.id === finding.id && entry.package === finding.package);
    if (!exception || finding.severity === 'critical' || exception.severity !== finding.severity ||
        !sameValues(finding.versions, exception.versions)) throw new Error(`Unreviewed advisory: ${finding.id} (${finding.package})`);
    if (!exception.reason || !Number.isFinite(Date.parse(exception.expires)) || Date.parse(exception.expires) <= now) {
      throw new Error(`Expired advisory review: ${finding.id}`);
    }
  }
  return report.advisories.length;
}
module.exports = { enforce };
