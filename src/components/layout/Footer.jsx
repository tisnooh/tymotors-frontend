import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/shared/Logo';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Newsletter } from '@/lib/api';
import { toast } from 'sonner';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const SOCIAL_LINKS = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

const BRAND_LINKS = [
  { slug: 'bmw', name: 'BMW' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
  { slug: 'audi', name: 'Audi' },
  { slug: 'porsche', name: 'Porsche' },
  { slug: 'volkswagen', name: 'Volkswagen' },
  { slug: 'toyota', name: 'Toyota' },
];

function Column({ title, children }) {
  return (
    <>
      <h4 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm text-ty-textMid">{children}</ul>
    </>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link className="hover:text-white transition-colors" to={to}>{children}</Link>
    </li>
  );
}

function BrandColumn() {
  const { t } = useTranslation();
  return (
    <div className="md:col-span-4">
      <Logo size="lg" />
      <p className="mt-5 text-sm leading-relaxed text-ty-textMid max-w-sm">{t('footer.brand_desc')}</p>
      <div className="mt-6 flex items-center gap-3">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
          <a key={label} href={href} aria-label={label} className="h-9 w-9 rounded-full border border-[#232B3A] flex items-center justify-center text-ty-textMid hover:text-white hover:border-[#2E394D] transition-colors">
            <Icon className="h-4 w-4" />
          </a>
        ))}
        <div className="ml-2 hidden md:flex">
          <LanguageSwitcher variant="footer" />
        </div>
      </div>
    </div>
  );
}

function ShopColumn() {
  const { t } = useTranslation();
  return (
    <div className="md:col-span-2">
      <Column title={t('footer.shop')}>
        <FooterLink to="/shop">{t('footer.links.shop_all')}</FooterLink>
        <FooterLink to="/category/performance">{t('nav.performance')}</FooterLink>
        <FooterLink to="/category/interior">{t('nav.interior')}</FooterLink>
        <FooterLink to="/category/technology">{t('nav.technology')}</FooterLink>
        <FooterLink to="/shop?sort=new">{t('footer.links.new_arrivals')}</FooterLink>
      </Column>
    </div>
  );
}

function BrandsColumn() {
  const { t } = useTranslation();
  return (
    <div className="md:col-span-2">
      <Column title={t('footer.brands')}>
        {BRAND_LINKS.map((b) => (
          <FooterLink key={b.slug} to={`/brands/${b.slug}`}>{b.name}</FooterLink>
        ))}
      </Column>
    </div>
  );
}

function NewsletterColumn() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubmitting(true);
      await Newsletter.signup(email, i18n.language?.startsWith('fr') ? 'fr' : 'en');
      toast.success(i18n.language?.startsWith('fr') ? 'Merci pour votre inscription.' : 'Thanks for subscribing.');
      setEmail('');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[TYMotors] newsletter signup failed:', err?.message || err);
      toast.error(i18n.language?.startsWith('fr') ? "Une erreur s'est produite." : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [email, i18n.language]);

  return (
    <div className="md:col-span-4">
      <h4 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-4">{t('footer.newsletter_title')}</h4>
      <p className="text-sm text-ty-textMid mb-4">{t('footer.newsletter_sub')}</p>
      <form data-testid="newsletter-form" onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="newsletter-email-input"
          placeholder={t('footer.newsletter_placeholder')}
          className="flex-1 h-11 px-4 rounded-xl bg-[#0F1115] border border-[#232B3A] text-sm text-white placeholder:text-ty-textLow focus:border-[#E10600] transition-colors"
        />
        <button
          type="submit"
          disabled={submitting}
          data-testid="newsletter-submit-button"
          className="ty-btn-primary uppercase tracking-[0.18em] text-xs disabled:opacity-50"
        >
          {submitting ? '\u2026' : t('footer.newsletter_button')}
        </button>
      </form>

      <ul className="mt-8 grid grid-cols-2 gap-2 text-xs text-ty-textLow">
        <li><Link className="hover:text-ty-textMid transition-colors" to="/support/contact">{t('footer.links.contact')}</Link></li>
        <li><Link className="hover:text-ty-textMid transition-colors" to="/support/shipping">{t('footer.links.shipping')}</Link></li>
        <li><Link className="hover:text-ty-textMid transition-colors" to="/support/returns">{t('footer.links.returns')}</Link></li>
        <li><Link className="hover:text-ty-textMid transition-colors" to="/support/faq">{t('footer.links.faq')}</Link></li>
        <li><Link className="hover:text-ty-textMid transition-colors" to="/customize">{t('footer.links.compatibility')}</Link></li>
        <li><Link className="hover:text-ty-textMid transition-colors" to="/support/track">{t('footer.links.track')}</Link></li>
      </ul>
    </div>
  );
}

function LegalBar() {
  const { t } = useTranslation();
  return (
    <div className="ty-container mt-14 pt-6 border-t border-[#151A23] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ty-textLow">
      <div>{t('footer.copyright')}</div>
      <div className="flex items-center gap-5">
        <Link to="/legal/privacy" className="hover:text-ty-textMid transition-colors">{t('footer.links.privacy')}</Link>
        <Link to="/legal/terms" className="hover:text-ty-textMid transition-colors">{t('footer.links.terms')}</Link>
        <Link to="/legal/cookies" className="hover:text-ty-textMid transition-colors">{t('footer.links.cookies')}</Link>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer data-testid="footer" className="relative pt-20 pb-10 border-t border-[#151A23] bg-[#070809] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2C94C]/40 to-transparent" />
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent" />

      <div className="ty-container grid grid-cols-1 md:grid-cols-12 gap-10">
        <BrandColumn />
        <ShopColumn />
        <BrandsColumn />
        <NewsletterColumn />
      </div>

      <LegalBar />
    </footer>
  );
}
