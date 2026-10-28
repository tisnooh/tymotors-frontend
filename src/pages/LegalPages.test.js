import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MentionsPage, WithdrawalPage, TermsPage, PrivacyPage } from './LegalPages';
import { SiteConfig, Withdrawals } from '@/lib/api';
jest.mock('@/lib/api', () => ({ SiteConfig: { get: jest.fn() }, Withdrawals: { send: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks(); host=document.createElement('div'); root=createRoot(host); SiteConfig.get.mockResolvedValue({ legal:{},legal_ready:false }); });
afterEach(() => act(() => root.unmount()));
test('missing business identity stays explicit, not invented', async () => {
  await act(async () => root.render(<MentionsPage/>));
  expect(host.textContent).toContain('[SIRET à renseigner]');
  expect(host.textContent).toContain('Version de préparation');
});
test('withdrawal requires an explicit decision before submission', async () => {
  await act(async () => root.render(<WithdrawalPage/>));
  expect(host.querySelector('button[type="submit"]') || host.querySelector('form button')).toBeTruthy();
  expect(host.querySelector('form button').disabled).toBe(true);
  expect(Withdrawals.send).not.toHaveBeenCalled();
});

test('payment mode wording follows server configuration without changing the code', async () => {
  await act(async () => root.render(<TermsPage/>));
  expect(host.textContent).toContain('Le mode de paiement n’a pas pu être confirmé.');
  expect(host.textContent).not.toContain('Stripe fonctionne en test');
  await act(async () => root.unmount()); root=createRoot(host);
  SiteConfig.get.mockResolvedValue({ legal:{},legal_ready:true,stripe_mode:'live' });
  await act(async () => root.render(<TermsPage/>));
  expect(host.textContent).not.toContain('Actuellement Stripe fonctionne en test.');
  expect(host.textContent).toContain('Les achats fournisseurs restent soumis à une validation humaine');
});
test('test configuration never promises an actual shipment or successful payment', async () => {
  SiteConfig.get.mockResolvedValue({ legal: {}, legal_ready: false, stripe_mode: 'test' });
  await act(async () => root.render(<TermsPage />));
  expect(host.textContent).toContain('configuration indique un environnement Stripe de test');
  expect(host.textContent).toContain('aucun paiement réel ni expédition');
});
test.each([null, { legal: null }, { legal: { address: {}, siret: 123 }, legal_ready: true }])('invalid public legal data fails closed (%j)', async data => {
  SiteConfig.get.mockResolvedValue(data); await act(async () => root.render(<MentionsPage />));
  expect(host.textContent).toContain('[SIRET à renseigner]'); expect(host.textContent).toContain('Version de préparation');
});
test('withdrawal alternatives, standard finish and unknown return address stay explicit', async () => {
  await act(async () => root.render(<WithdrawalPage />));
  expect(host.textContent).toContain('Le formulaire ci-dessous n’est pas obligatoire');
  expect(host.textContent).toContain('[Email du vendeur à renseigner]');
  expect(host.textContent).toContain('[Adresse de retour à renseigner]');
  expect(host.textContent).toContain('variante standard de couleur ou de finition ne suffit pas');
  expect(host.textContent).toContain('moyen de paiement initial');
});
const enterWithdrawal = () => act(() => {
  const values = ['Client Test', 'client@example.test', 'TY-TEST-123'];
  [...host.querySelectorAll('form input:not([type="checkbox"])')].forEach((input, index) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, values[index]);
    input.dispatchEvent(new Event('change', { bubbles: true })); input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  host.querySelector('input[type="checkbox"]').click();
});
const submitWithdrawal = () => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
const receipt = { reference: 'withdrawal-test-123', received_at: '2026-10-28T12:00:00+00:00', receipt_text: 'Déclaration de rétractation de test', email_sent: false };
test('a stored withdrawal without sent email shows the downloadable receipt, never an email delivery claim', async () => {
  Withdrawals.send.mockResolvedValue(receipt); await act(async () => root.render(<WithdrawalPage />)); enterWithdrawal();
  await act(async () => submitWithdrawal());
  expect(Withdrawals.send).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain(receipt.reference); expect(host.textContent).toContain('email n’a pas pu être envoyé');
  expect(host.textContent).not.toContain('Accusé de réception envoyé par email.');
  expect(host.textContent).toContain('Télécharger l’accusé de réception');
});
test('a malformed 200 receipt never claims registration or email success', async () => {
  Withdrawals.send.mockResolvedValue({ ...receipt, email_sent: 'true' });
  await act(async () => root.render(<WithdrawalPage />)); enterWithdrawal(); await act(async () => submitWithdrawal());
  expect(host.querySelector('[role="alert"]').textContent).toContain('Enregistrement en ligne non confirmé');
  expect(host.textContent).not.toContain('Demande enregistrée le');
});
test('a double submission is one request and an unchecked decision sends nothing', async () => {
  Withdrawals.send.mockResolvedValue(receipt); await act(async () => root.render(<WithdrawalPage />));
  await act(async () => submitWithdrawal()); expect(Withdrawals.send).not.toHaveBeenCalled();
  enterWithdrawal(); await act(async () => { submitWithdrawal(); submitWithdrawal(); });
  expect(Withdrawals.send).toHaveBeenCalledTimes(1);
});
test('privacy does not assert an unverified hosting location or working logistics connection', async () => {
  await act(async () => root.render(<PrivacyPage />));
  expect(host.textContent).not.toContain('La base est hébergée à Paris');
  expect(host.textContent).toContain('doivent être confirmés avant lancement');
  expect(host.textContent).toContain('ne reçoivent que les informations nécessaires');
  expect(host.textContent).not.toContain('HyperSKU');
});
test('legal information never links to the discontinued ODR platform or fabricates a mediator', async () => {
  await act(async () => root.render(<MentionsPage />));
  expect(host.textContent).toContain('fermée depuis le 20 juillet 2025');
  expect(host.textContent).toContain('[Médiateur agréé choisi à renseigner]');
  expect([...host.querySelectorAll('a')].some(anchor => /consumers\/odr/.test(anchor.href))).toBe(false);
});
