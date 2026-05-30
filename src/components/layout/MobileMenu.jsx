import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Heart, ShoppingBag, Search } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useApp } from '@/contexts/AppContext';

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen, setSearchOpen } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const items = [
    { to: '/shop', label: t('nav.shop_all') },
    { to: '/category/performance', label: t('nav.performance') },
    { to: '/category/interior', label: t('nav.interior') },
    { to: '/category/technology', label: t('nav.technology') },
    { to: '/brands', label: t('nav.brands') },
    { to: '/customize', label: t('nav.customize_long') },
    { to: '/wishlist', label: t('nav.wishlist') },
    { to: '/cart', label: t('nav.cart') },
  ];

  if (!mobileMenuOpen) return null;

  return (
    <div data-testid="mobile-menu-sheet" className="fixed inset-0 z-[90] bg-[#050608]/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600]/60 to-transparent" />
      <div className="ty-container flex items-center justify-between h-16">
        <Logo size="md" />
        <button
          onClick={() => setMobileMenuOpen(false)}
          data-testid="mobile-menu-close-button"
          className="h-10 w-10 rounded-full border border-[#232B3A] inline-flex items-center justify-center text-ty-textMid hover:text-white"
          aria-label={t('nav.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="ty-container pt-8 pb-12">
        <button
          onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
          className="w-full flex items-center gap-3 px-4 h-12 rounded-xl bg-[#0F1115] border border-[#232B3A] text-ty-textMid mb-8"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">{t('nav.search')}{'\u2026'}</span>
        </button>

        <ul className="space-y-1" data-testid="mobile-menu-list">
          {items.map((item, idx) => (
            <li key={item.to} style={{ animationDelay: `${idx * 60}ms` }} className="animate-in fade-in-50 slide-in-from-bottom-4">
              <Link
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between py-4 border-b border-[#151A23] text-white"
              >
                <span className="text-2xl font-display font-medium">{item.label}</span>
                <span className="font-mono text-[10px] tracking-[0.4em] text-[#F2C94C]/70 group-hover:text-[#E10600] transition-colors">
                  0{idx + 1}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center justify-between">
          <LanguageSwitcher variant="footer" />
          <Link
            onClick={() => setMobileMenuOpen(false)}
            to="/shop"
            className="ty-btn-primary text-xs px-4 h-10 tracking-[0.18em] uppercase"
          >
            {t('nav.shop_now')}
          </Link>
        </div>
      </div>
    </div>
  );
}
