jest.mock('@/lib/api', () => ({ api: {} }));
import { errorMessage, money, date } from './api';

test('missing financial data is never presented as zero', () => {
  expect(money(null)).toBe('Non disponible');
  expect(money(undefined)).toBe('Non disponible');
  expect(money(0)).toContain('0,00');
});
test('money uses integer cents and French formatting', () => {
  expect(money(8990)).toContain('89,90');
  expect(money(-500)).toContain('-5,00');
});
test('authorization failures have actionable messages', () => {
  expect(errorMessage({ response: { status: 401 } })).toContain('Reconnectez');
  expect(errorMessage({ response: { status: 403 } })).toContain('administrateurs');
});
test('structured validation errors name their field', () => {
  expect(errorMessage({ response: { data: { detail: [{ loc: ['body', 'sku'], msg: 'Champ requis' }] } } })).toBe('sku : Champ requis');
});
test('server and network errors are not swallowed', () => {
  expect(errorMessage({ response: { data: { detail: 'Stock insuffisant' } } })).toBe('Stock insuffisant');
  expect(errorMessage(new Error('Connexion interrompue'))).toBe('Connexion interrompue');
});
test('missing dates stay explicitly unavailable', () => {
  expect(date(null)).toBe('—');
});
