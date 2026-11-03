import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import OrderSuccess from './OrderSuccess';
import { Checkout } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';

jest.mock('@/lib/api', () => ({ Checkout: { get: jest.fn() } }));
jest.mock('@/contexts/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, ...props }) => <a href={to} {...props} />,
  useSearchParams: () => [new URLSearchParams('session_id=cs_fixture')],
}), { virtual: true });

let host;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  root = createRoot(host);
  useApp.mockReturnValue({ refreshCart: jest.fn() });
});

afterEach(() => {
  act(() => root.unmount());
  jest.clearAllMocks();
});

const order = (payment_status, paid = false) => ({
  payment_status, paid, is_test: false, customer_email: 'client@example.com',
  items: [{ product_id: 'p1', name: 'Pièce', quantity: 1, unit_amount: 1000 }],
  shipping: 15, total: 25, currency: 'EUR', order_reference: 'TY-FIXTURE',
});

test.each([
  ['failed', 'Paiement non abouti', 'Ce paiement n’a pas été confirmé.'],
  ['refunded', 'Commande remboursée', 'Le paiement de cette commande a été remboursé.'],
])('a %s payment is not presented as pending', async (status, title, explanation) => {
  Checkout.get.mockResolvedValue(order(status));
  await act(async () => root.render(<OrderSuccess />));
  expect(host.querySelector('h1').textContent).toBe(title);
  expect(host.textContent).toContain(explanation);
  expect(host.textContent).not.toContain('Paiement en cours');
  expect(host.textContent).not.toContain('La validation attend');
});

test('a paid order keeps its confirmation and refreshes the cart', async () => {
  Checkout.get.mockResolvedValue(order('paid', true));
  await act(async () => root.render(<OrderSuccess />));
  expect(host.querySelector('h1').textContent).toBe('Paiement confirmé');
  expect(useApp().refreshCart).toHaveBeenCalledTimes(1);
});
