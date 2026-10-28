import { LEGAL_FIELDS, publicSiteConfig } from './usePublicSiteConfig';

test.each([null, undefined, {}, { legal: null }, { legal: 'not-an-object' }])('missing config never invents business identity (%j)', response => {
  const config = publicSiteConfig(response);
  expect(config.legal_ready).toBe(false); expect(config.stripe_mode).toBeNull();
  expect(Object.values(config.legal).every(value => value === '')).toBe(true);
});
test('public legal data is allowlisted, typed and trimmed, never a secret or inherited property', () => {
  const config = publicSiteConfig({ legal: { company_name: '  Test  ', address: { text: 'bad' }, secret: 'not-public' }, stripe_mode: 'test' });
  expect(config.legal.company_name).toBe('Test'); expect(config.legal.address).toBe('');
  expect(config.legal).not.toHaveProperty('secret'); expect(config.stripe_mode).toBe('test');
  expect(publicSiteConfig({ legal: Object.create({ company_name: 'Inherited' }) }).legal.company_name).toBe('');
});
test('server completeness does not hide missing legal fields', () => {
  expect(publicSiteConfig({ legal: { company_name: 'Test' }, legal_ready: true }).legal_ready).toBe(false);
  const legal = Object.fromEntries(LEGAL_FIELDS.map(field => [field, 'Explicit operator-provided test value']));
  expect(publicSiteConfig({ legal, legal_ready: true }).legal_ready).toBe(true);
  expect(publicSiteConfig({ legal, legal_ready: false }).legal_ready).toBe(false);
});
