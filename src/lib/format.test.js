import { formatPrice } from './format';

test('charged amounts retain their cents in French and English', () => {
  expect(formatPrice(2.49, 'EUR', 'fr')).toContain('2,49');
  expect(formatPrice(139.95, 'EUR', 'en')).toContain('139.95');
  expect(formatPrice(0.01, 'EUR', 'fr')).toContain('0,01');
});

test('whole catalogue prices keep the existing compact display', () => {
  expect(formatPrice(139, 'EUR', 'fr')).toContain('139');
  expect(formatPrice(139, 'EUR', 'fr')).not.toContain(',00');
});

test('fallback formatting preserves cents as well', () => {
  expect(formatPrice(2.49, 'invalid-currency', 'fr')).toContain('2.49');
});
