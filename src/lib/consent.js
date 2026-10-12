export const CONSENT_KEY = 'ty_cookie_preferences';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 183 * 24 * 60 * 60 * 1000;
export const CONSENT_CHANGED = 'ty-consent-changed';
export const CONSENT_OPEN = 'ty-consent-open';
let volatileChoice = null;
export function readConsent(now = Date.now()) {
  let value;
  try { value = JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch { value = volatileChoice; }
  if (!value || value.version !== CONSENT_VERSION || !Number.isFinite(value.savedAt)
    || value.savedAt > now || now - value.savedAt >= CONSENT_MAX_AGE
    || typeof value.analytics !== 'boolean' || typeof value.marketing !== 'boolean') return null;
  return { ...value, essential: true };
}
export function saveConsent({ analytics = false, marketing = false }) {
  const choice = { version: CONSENT_VERSION, savedAt: Date.now(), essential: true, analytics: analytics === true, marketing: marketing === true };
  volatileChoice = choice;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(choice)); } catch { /* Session-only fallback. */ }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED));
  return choice;
}
// No optional provider is integrated. Future services must check before loading
// and stop on CONSENT_CHANGED after revocation. Adding a provider requires a
// specific policy disclosure and a CONSENT_VERSION bump for fresh consent.
export function hasConsent(category) { return ['analytics', 'marketing'].includes(category) && readConsent()?.[category] === true; }
export function openConsent() { window.dispatchEvent(new CustomEvent(CONSENT_OPEN)); }
