import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher({ variant = 'navbar' }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('fr') ? 'FR' : 'EN';

  const toggle = () => {
    const next = current === 'FR' ? 'en' : 'fr';
    i18n.changeLanguage(next);
    try {
      localStorage.setItem('ty_lang', next);
    } catch (e) {
      // Storage may be unavailable in private mode or restricted environments
      // eslint-disable-next-line no-console
      console.warn('[TYMotors] could not persist language preference:', e?.message || e);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="navbar-language-switcher-button"
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.25em] uppercase transition-colors ${
        variant === 'navbar' ? 'text-ty-textMid hover:text-white' : 'text-ty-textMid hover:text-white'
      }`}
      aria-label="Change language"
    >
      <span className="opacity-90">{current}</span>
      <span className="text-[#F2C94C] opacity-50">/</span>
      <span className="opacity-50">{current === 'EN' ? 'FR' : 'EN'}</span>
    </button>
  );
}
