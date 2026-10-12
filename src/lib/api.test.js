import { getSessionId } from './api';
import { randomFillSync } from 'crypto';

// jsdom supplied by react-scripts predates Web Crypto; exercise the secure fallback.
beforeAll(() => Object.defineProperty(global, 'crypto', { configurable: true,
  value: { getRandomValues: value => randomFillSync(value) } }));

beforeEach(() => localStorage.clear());
test('guest capability is cryptographically random and persists', () => {
  const value = getSessionId();
  expect(value).toMatch(/^[A-Za-z0-9_-]{16,128}$/);
  expect(getSessionId()).toBe(value);
});
test('invalid legacy session is replaced, not sent as a capability', () => {
  localStorage.setItem('ty_session_id', 'short');
  expect(getSessionId()).not.toBe('short');
  expect(getSessionId().length).toBeGreaterThanOrEqual(16);
});
