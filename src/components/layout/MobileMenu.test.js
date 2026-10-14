/* eslint-env node */
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import fs from 'fs';
import path from 'path';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { TestAppContext } from '@/contexts/AppContext';
import fr from '@/lib/locales/fr.json';
import en from '@/lib/locales/en.json';

let mockLanguage = 'fr';
let mockPathname = '/';
const mockChangeLanguage = jest.fn();
jest.mock('@/contexts/AppContext', () => {
  const React = require('react');
  const TestAppContext = React.createContext(null);
  return { TestAppContext, useApp: () => React.useContext(TestAppContext) };
});
jest.mock('@/lib/api', () => ({ Products: { list: jest.fn() } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({
  t: key => key.split('.').reduce((value, part) => value?.[part], require(`@/lib/locales/${mockLanguage}.json`)) ?? key,
  i18n: { language: mockLanguage, changeLanguage: mockChangeLanguage },
}) }));
jest.mock('react-router-dom', () => {
  const React = require('react');
  function Link({ to, onClick, className, children, ...props }) {
    const active = mockPathname === to;
    return <a href={to} {...props} className={typeof className === 'function' ? className({ isActive: active }) : className}
      onClick={event => { event.preventDefault(); onClick?.(event); }}>
      {typeof children === 'function' ? children({ isActive: active }) : children}
    </a>;
  }
  return { Link, NavLink: Link, useLocation: () => ({ pathname: mockPathname }), useNavigate: () => jest.fn() };
}, { virtual: true });

function Harness() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return <TestAppContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, cartCount: 2, wishlistCount: 1 }}>
    <Navbar /><MobileMenu /><SearchOverlay /><main><a href="/background">Outside navigation</a></main>
  </TestAppContext.Provider>;
}

let root, host;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const query = id => document.querySelector(`[data-testid="${id}"]`);
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
// Commit the state change first, then flush Radix's deferred focus restoration.
// A timer inside the same async act can fire before React commits on a busy host.
async function settleFocus() { await act(async () => { await tick(); }); }
async function click(element) { await act(async () => element.click()); await settleFocus(); }
async function openMenu() {
  const trigger = query('navbar-mobile-menu-button');
  trigger.focus();
  await click(trigger);
  return query('mobile-menu-sheet');
}
beforeEach(async () => {
  mockLanguage = 'fr'; mockPathname = '/'; jest.clearAllMocks();
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
  await act(async () => root.render(<Harness />));
  await settleFocus();
});
afterEach(async () => {
  await act(async () => root.unmount());
  await settleFocus();
  host.remove();
});

test('is absent when closed and announces modal state and initial close focus when opened', async () => {
  expect(query('mobile-menu-sheet')).toBeNull();
  const trigger = query('navbar-mobile-menu-button');
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  const panel = await openMenu();
  expect(panel.getAttribute('role')).toBe('dialog');
  expect(panel.getAttribute('aria-modal')).toBe('true');
  expect(document.getElementById(panel.getAttribute('aria-labelledby')).textContent).toBe(fr.mobile_menu.title);
  expect(document.getElementById(panel.getAttribute('aria-describedby')).textContent).toBe(fr.mobile_menu.description);
  expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(query('mobile-menu-close-button'));
});

test('isolates background accessibility and releases the modal lock after closing', async () => {
  await openMenu();
  expect(host.getAttribute('aria-hidden')).toBe('true');
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
  await click(query('mobile-menu-close-button'));
  expect(query('mobile-menu-sheet')).toBeNull();
  expect(host.hasAttribute('aria-hidden')).toBe(false);
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
  expect(document.activeElement).toBe(query('navbar-mobile-menu-button'));
});

test('keeps account, wishlist and cart ahead of the six catalogue links with real context counts', async () => {
  const panel = await openMenu();
  const scroller = query('mobile-menu-scroll');
  expect(scroller.hasAttribute('data-lenis-prevent')).toBe(true);
  expect(panel.hasAttribute('data-lenis-prevent')).toBe(true);
  const links = [...scroller.querySelectorAll('a')];
  expect(links.slice(0, 3).map(link => link.getAttribute('href'))).toEqual(['/account', '/wishlist', '/cart']);
  expect(query('mobile-menu-account-link').textContent).toContain(fr.mobile_menu.account);
  expect(query('mobile-menu-cart-link').getAttribute('aria-label')).toBe('Panier (2)');
  expect(query('mobile-menu-wishlist-link').getAttribute('aria-label')).toBe('Favoris (1)');
  expect([...query('mobile-menu-list').querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual([
    '/shop', '/category/performance', '/category/interior', '/category/technology', '/brands', '/customize',
  ]);
  expect(scroller.querySelector('a[href="/support/track"]')).not.toBeNull();
  expect(scroller.querySelector('a[href="/support/contact"]')).not.toBeNull();
});

test('does not overwrite an existing inline page overflow style when the modal closes', async () => {
  document.body.style.overflow = 'auto';
  try {
    await openMenu();
    expect(document.body.style.overflow).toBe('auto');
    await click(query('mobile-menu-close-button'));
    expect(document.body.style.overflow).toBe('auto');
  } finally { document.body.style.overflow = ''; }
});

test.each(['/account', '/cart', '/wishlist', '/category/interior', '/support/track', '/support/contact'])('choosing %s closes the menu and restores the trigger', async route => {
  const panel = await openMenu();
  await click(panel.querySelector(`a[href="${route}"]`));
  expect(query('mobile-menu-sheet')).toBeNull();
  expect(document.activeElement).toBe(query('navbar-mobile-menu-button'));
});

test('the brand link closes the menu even when already on the homepage', async () => {
  const panel = await openMenu();
  await click(panel.querySelector('[data-testid="logo-link"]'));
  expect(query('mobile-menu-sheet')).toBeNull();
});

test('Escape closes without losing the focus return or leaving the page locked', async () => {
  await openMenu();
  await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await settleFocus();
  expect(query('mobile-menu-sheet')).toBeNull();
  expect(document.activeElement).toBe(query('navbar-mobile-menu-button'));
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
});

test('Tab and Shift+Tab wrap inside the real modal rather than reaching background links', async () => {
  const panel = await openMenu();
  const first = panel.querySelector('a'); const last = query('mobile-menu-footer').querySelector('a');
  await act(async () => {
    first.focus(); first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
  });
  expect(document.activeElement).toBe(last);
  await act(async () => {
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  });
  expect(document.activeElement).toBe(first);
});

test('search replaces the menu and keeps the page locked until search closes', async () => {
  await openMenu();
  await click(query('mobile-menu-search-button'));
  expect(query('mobile-menu-sheet')).toBeNull();
  expect(query('search-overlay')).not.toBeNull();
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 110)); });
  expect(document.activeElement).toBe(query('search-overlay-input'));
  await click(query('search-overlay-close-button'));
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
  expect(document.body.style.overflow).toBe('');
  await openMenu();
  expect(document.activeElement).toBe(query('mobile-menu-close-button'));
});

test('English copy and language action remain available in the scrollable footer', async () => {
  mockLanguage = 'en';
  await act(async () => root.render(<Harness />));
  const panel = await openMenu();
  expect(panel.textContent).toContain(en.mobile_menu.account);
  expect(panel.textContent).toContain(en.mobile_menu.track);
  await click(query('mobile-menu-footer').querySelector('button'));
  expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
  expect(query('mobile-menu-sheet')).not.toBeNull();
});

test('CSS bounds the internal scroller, keeps the header fixed, reserves safe areas and honors reduced motion', () => {
  const css = fs.readFileSync(path.join(__dirname, 'MobileMenu.css'), 'utf8');
  expect(css).toMatch(/height: 100dvh/);
  expect(css).toContain('z-index: 160');
  expect(css).toMatch(/\.mobile-menu-scroll\s*\{[^}]*min-height: 0;[^}]*overflow-y: auto;/s);
  expect(css).toContain('overscroll-behavior-y: contain');
  expect(css).toContain('-webkit-overflow-scrolling: touch');
  expect(css).toContain('touch-action: pan-y');
  expect(css).toMatch(/\.mobile-menu-header\s*\{[^}]*flex-shrink: 0;/s);
  expect(css).toContain('env(safe-area-inset-bottom, 0px)');
  expect(css).toContain('(max-width: 359px)');
  expect(css).toContain('prefers-reduced-motion: reduce');
  expect(css).toMatch(/animation: none/);
});
