const { test } = require('node:test');
const assert = require('node:assert/strict');
const { enforce } = require('./dependency_policy.cjs');
const baseline = require('./dependency-baseline.json');
const now = Date.parse('2026-10-13T12:00:00Z');
const finding = { id: 'GHSA-vfj7-8cjw-p6xm', package: 'braces', severity: 'high', versions: ['3.0.3'] };
const report = (advisories = [finding]) => ({ summary: { vulnerabilities: { high: advisories.length } }, advisories });
test('audit policy: approved exact residual remains visible, and zero findings pass', () => {
  assert.equal(enforce(report(), baseline, now), 1);
  assert.equal(enforce(report([]), baseline, now), 0);
});
test('audit policy: new advisory and changed versions fail closed', () => {
  for (const patch of [{ id: 'new-advisory' }, { versions: ['3.0.2'] }, { versions: ['3.0.3', '3.0.2'] }]) {
    assert.throws(() => enforce(report([{ ...finding, ...patch }]), baseline, now), /Unreviewed/);
  }
});
test('audit policy: elevated or lowered severity needs a fresh review', () => {
  for (const severity of ['critical', 'moderate']) assert.throws(() => enforce(report([{ ...finding, severity }]), baseline, now), /Unreviewed/);
});
test('audit policy: unavailable/incomplete audit fails closed', () => {
  assert.throws(() => enforce({}, baseline, now), /unavailable/);
  assert.throws(() => enforce({ ...report(), advisories: [] }, baseline, now), /Incomplete/);
});
test('audit policy: exception expires and requires a documented reason', () => {
  assert.throws(() => enforce(report(), baseline, Date.parse('2026-11-14')), /Expired/);
  assert.throws(() => enforce(report(), { exceptions: [{ ...baseline.exceptions[0], reason: '' }] }, now), /Expired/);
});
