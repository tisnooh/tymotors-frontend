import React, { useEffect, useState, useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Heart, ShoppingBag, Menu } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useApp } from '@/contexts/AppContext';

function navbarStateClass(scrolled, isHome) {
  if (scrolled) {
    return 'bg-[rgba(10,11,14,0.78)] backdrop-blur-xl border-b border-[rgba(35,43,58,0.7)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]';
  }
  if (isHome) return 'bg-transparent';
  return 'bg-[rgba(10,11,14,0.7)] backdrop-blur-xl border-b border-[rgba(35,43,58,0.4)]';
}

function CountBadge({ count }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E10600] text-white text-[10px] font-mono flex items-center justify-center">
      {count}
    </span>
  );
}

function IconButton({ children, label, onClick, testId, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label={label}
      className={`h-10 w-10 inline-flex items-center justify-center rounded-full text-ty-textMid hover:text-white hover:bg-white/5 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function NavLinkItem({ to, label, testId }) {
  return (
    <NavLink
      to={to}
      data-testid={testId}
      className={({ isActive }) =>
        `relative text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-ty-textMid hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <span className="relative inline-block py-2">
          {label}
          <span
            className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] origin-left transform bg-[#E10600] transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100`}
          />
        </span>
      )}
    </NavLink>
  );
}

function NavbarLeft() {
  return (
    <div className="flex items-center gap-8">
      <Logo size="md" />
      <div className="hidden md:flex items-center gap-1 font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]/60">
        <span className="h-px w-4 bg-[#F2C94C]/60" />
        EST. 2026
      </div>
    </div>
  );
}

function NavbarCenter({ items }) {
  return (
    <nav className="hidden lg:flex items-center gap-7" data-testid="navbar-main-nav">
      {items.map((item) => (
        <NavLinkItem
          key={item.to}
          to={item.to}
          label={item.label}
          testId={`nav-link-${item.to.replace(/[\/:]/g, '-')}`}
        />
      ))}
    </nav>
  );
}

function NavbarRight({ onOpenSearch, onOpenMobile, cartCount, wishlistCount, t }) {
  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <div className="hidden md:flex">
        <LanguageSwitcher />
      </div>
      <IconButton testId="navbar-search-button" label={t('nav.search')} onClick={onOpenSearch}>
        <Search className="h-[18px] w-[18px]" />
      </IconButton>
      <Link
        to="/wishlist"
        data-testid="navbar-wishlist-button"
        className="relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-ty-textMid hover:text-white hover:bg-white/5 transition-colors"
        aria-label={t('nav.wishlist')}
      >
        <Heart className="h-[18px] w-[18px]" />
        <CountBadge count={wishlistCount} />
      </Link>
      <Link
        to="/cart"
        data-testid="navbar-cart-button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ty-textMid hover:text-white hover:bg-white/5 transition-colors"
        aria-label={t('nav.cart')}
      >
        <ShoppingBag className="h-[18px] w-[18px]" />
        <CountBadge count={cartCount} />
      </Link>
      <Link
        to="/shop"
        data-testid="navbar-shop-now-button"
        className="hidden lg:inline-flex ty-btn-primary text-xs px-4 h-10 tracking-[0.18em] uppercase"
      >
        {t('nav.shop_now')}
      </Link>
      <IconButton testId="navbar-mobile-menu-button" label={t('nav.menu')} onClick={onOpenMobile} className="lg:hidden">
        <Menu className="h-[18px] w-[18px]" />
      </IconButton>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { cartCount, wishlistCount, setSearchOpen, setMobileMenuOpen } = useApp();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  const navItems = useMemo(() => ([
    { to: '/shop', label: t('nav.shop_all') },
    { to: '/category/performance', label: t('nav.performance') },
    { to: '/category/interior', label: t('nav.interior') },
    { to: '/category/technology', label: t('nav.technology') },
    { to: '/brands', label: t('nav.brands') },
    { to: '/customize', label: t('nav.customize') },
  ]), [t]);

  return (
    <header
      data-testid="navbar-container"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navbarStateClass(scrolled, isHome)}`}
    >
      <div
        className={`absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="ty-container flex items-center justify-between h-16 lg:h-20">
        <NavbarLeft />
        <NavbarCenter items={navItems} />
        <NavbarRight
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobile={() => setMobileMenuOpen(true)}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          t={t}
        />
      </div>
    </header>
  );
}
