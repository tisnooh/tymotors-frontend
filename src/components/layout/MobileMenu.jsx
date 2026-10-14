import React, { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ChevronRight, Heart, MessageCircle, PackageSearch, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useApp } from '@/contexts/AppContext';
import './MobileMenu.css';

function QuickLink({ to, label, count, icon: Icon, onSelect, testId }) {
  return <Link to={to} onClick={onSelect} className="mobile-menu-quick-link" data-testid={testId}
    aria-label={count > 0 ? `${label} (${count})` : label}>
    <Icon size={18} aria-hidden="true" />
    <span>{label}</span>
    {count > 0 && <span className="mobile-menu-count" aria-hidden="true">{count}</span>}
  </Link>;
}

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen, setSearchOpen, cartCount, wishlistCount } = useApp();
  const { t } = useTranslation();

  const closeButtonRef = useRef(null);
  const searchTransferRef = useRef(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const items = [
    { to: '/shop', label: t('nav.shop_all') },
    { to: '/category/performance', label: t('nav.performance') },
    { to: '/category/interior', label: t('nav.interior') },
    { to: '/category/technology', label: t('nav.technology') },
    { to: '/brands', label: t('nav.brands') },
    { to: '/customize', label: t('nav.customize') },
  ];

  // The existing modal primitive owns scroll locking, keyboard trapping and
  // hiding the background from assistive tech. Only the body below scrolls.
  return <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="mobile-menu-backdrop" data-lenis-prevent>
        <Dialog.Content id="ty-mobile-menu" aria-modal="true" data-testid="mobile-menu-sheet" className="mobile-menu-sheet" data-lenis-prevent
          onOpenAutoFocus={event => { event.preventDefault(); closeButtonRef.current?.focus({ preventScroll: true }); }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            if (!searchTransferRef.current) document.getElementById('ty-mobile-menu-trigger')?.focus({ preventScroll: true });
            searchTransferRef.current = false;
          }}>
          <header className="mobile-menu-header">
            <Logo size="md" accent={false} onClick={closeMenu} />
            <Dialog.Title className="sr-only">{t('mobile_menu.title')}</Dialog.Title>
            <Dialog.Description className="sr-only">{t('mobile_menu.description')}</Dialog.Description>
            <Dialog.Close asChild>
              <button ref={closeButtonRef} type="button" data-testid="mobile-menu-close-button" className="mobile-menu-close" aria-label={t('nav.close')}>
                <X size={20} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          <div className="mobile-menu-scroll" data-testid="mobile-menu-scroll" data-lenis-prevent>
            <div className="mobile-menu-inner">
              <button type="button" data-testid="mobile-menu-search-button" className="mobile-menu-search"
                onClick={() => { searchTransferRef.current = true; closeMenu(); setSearchOpen(true); }}>
                <Search size={18} aria-hidden="true" />
                <span>{t('nav.search')}{'\u2026'}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>

              <Link to="/account" onClick={closeMenu} data-testid="mobile-menu-account-link" className="mobile-menu-account">
                <span className="mobile-menu-account-icon"><UserRound size={22} aria-hidden="true" /></span>
                <span className="mobile-menu-account-copy"><strong>{t('mobile_menu.account')}</strong><span>{t('mobile_menu.account_hint')}</span></span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>

              <div className="mobile-menu-quick-links">
                <QuickLink to="/wishlist" label={t('nav.wishlist')} count={wishlistCount} icon={Heart} onSelect={closeMenu} testId="mobile-menu-wishlist-link" />
                <QuickLink to="/cart" label={t('nav.cart')} count={cartCount} icon={ShoppingBag} onSelect={closeMenu} testId="mobile-menu-cart-link" />
              </div>

              <nav aria-label={t('mobile_menu.catalogue')} className="mobile-menu-catalogue">
                <p className="mobile-menu-section-label">{t('mobile_menu.catalogue')}</p>
                <ul data-testid="mobile-menu-list">
                  {items.map((item, index) => <li key={item.to}>
                    <NavLink to={item.to} onClick={closeMenu} className={({ isActive }) => `mobile-menu-nav-link${isActive ? ' is-active' : ''}`}>
                      <span className="mobile-menu-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <span>{item.label}</span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </NavLink>
                  </li>)}
                </ul>
              </nav>

              <nav aria-label={t('mobile_menu.help')} className="mobile-menu-help">
                <p className="mobile-menu-section-label">{t('mobile_menu.help')}</p>
                <div className="mobile-menu-help-links">
                  <Link to="/support/track" onClick={closeMenu}><PackageSearch size={18} aria-hidden="true" /><span>{t('mobile_menu.track')}</span></Link>
                  <Link to="/support/contact" onClick={closeMenu}><MessageCircle size={18} aria-hidden="true" /><span>{t('mobile_menu.contact')}</span></Link>
                </div>
              </nav>

              <footer className="mobile-menu-footer" data-testid="mobile-menu-footer">
                <div className="mobile-menu-language"><LanguageSwitcher variant="footer" /></div>
                <Link to="/shop" onClick={closeMenu} className="mobile-menu-shop">{t('nav.shop_now')}<ArrowUpRight size={16} aria-hidden="true" /></Link>
              </footer>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Portal>
  </Dialog.Root>;
}
