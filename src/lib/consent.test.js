import { CONSENT_KEY, CONSENT_VERSION, CONSENT_MAX_AGE, readConsent, saveConsent, hasConsent } from './consent';
beforeEach(() => localStorage.clear());
test('unknown and legacy choices never permit optional tracking', () => {
  expect(readConsent()).toBeNull(); expect(hasConsent('analytics')).toBe(false);
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true })); expect(readConsent()).toBeNull();
});
test('refusal, granular consent and revocation persist equally', () => {
  saveConsent({}); expect(hasConsent('marketing')).toBe(false);
  saveConsent({ analytics: true }); expect(hasConsent('analytics')).toBe(true); expect(hasConsent('marketing')).toBe(false);
  saveConsent({}); expect(hasConsent('analytics')).toBe(false);
});
test('expired, future or malformed choice fails closed', () => {
  for (const value of [ { version: CONSENT_VERSION, savedAt: Date.now()-CONSENT_MAX_AGE, analytics: true, marketing: true }, { version: CONSENT_VERSION, savedAt: Date.now()+60000, analytics: true, marketing: true }, { version: CONSENT_VERSION, savedAt: Date.now(), analytics: 'true', marketing: false } ]) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); expect(readConsent()).toBeNull();
  }
});
