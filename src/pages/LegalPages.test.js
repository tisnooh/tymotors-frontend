import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MentionsPage, WithdrawalPage } from './LegalPages';
import { SiteConfig, Withdrawals } from '@/lib/api';
jest.mock('@/lib/api', () => ({ SiteConfig: { get: jest.fn() }, Withdrawals: { send: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, ...props }) => require('react').createElement('a', { href: to, ...props }) }), { virtual: true });
let root, host;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; host=document.createElement('div'); root=createRoot(host); SiteConfig.get.mockResolvedValue({ legal:{},legal_ready:false }); });
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
