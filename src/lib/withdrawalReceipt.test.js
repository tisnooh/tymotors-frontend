import { withdrawalReceipt } from './withdrawalReceipt';

const receipt = { reference: 'withdrawal-test', received_at: '2026-10-28T12:00:00+00:00', receipt_text: 'Déclaration de test', email_sent: false };
test('a complete stored receipt is preserved whether its email was sent or not', () => {
  expect(withdrawalReceipt(receipt)).toBe(receipt);
  expect(withdrawalReceipt({ ...receipt, email_sent: true }).email_sent).toBe(true);
});
test.each([null, {}, ...[{ reference: '' }, { reference: 123 }, { received_at: 'invalid' },
  { received_at: '2026-10-28T12:00:00' }, { receipt_text: ' ' }, { receipt_text: null }, { email_sent: 'false' },
  { email_sent: null }, { email_sent: undefined }].map(change => ({ ...receipt, ...change }))])('malformed receipt never becomes proof (%j)', response => {
  expect(() => withdrawalReceipt(response)).toThrow();
});
