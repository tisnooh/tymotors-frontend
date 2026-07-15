import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { Trash2, ArrowRight, Truck, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { Checkout } from '@/lib/api';
import { toast } from 'sonner';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { cart, updateCart, removeFromCart } = useApp();
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = cart.subtotal || 0;
  const shipping = cart.shipping || 0;
  const shippingFree = shipping === 0;
  const total = cart.total ?? (subtotal + shipping);

  const startCheckout = async () => {
    try {
      setCheckingOut(true);
      const data = await Checkout.create();
      if (!data.url) throw new Error('missing_checkout_url');
      window.location.assign(data.url);
    } catch (error) {
      const message = error?.response?.data?.detail;
      toast.error(message || (i18n.language?.startsWith('fr') ? 'Le paiement est momentanément indisponible.' : 'Checkout is temporarily unavailable.'));
      setCheckingOut(false);
    }
  };

  return (
    <main data-testid="page-cart" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Checkout
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('cart.title')}</h1>
        </Reveal>

        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <ul className="divide-y divide-[#151A23] border-y border-[#151A23]">
                {cart.items.map((it) => (
                  <li key={it.product_id} data-testid="cart-item" className="py-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link to={`/product/${it.slug}`} className="h-24 w-32 rounded-xl overflow-hidden bg-[#0F1115] border border-[#151A23] shrink-0">
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#F2C94C]/80">{it.subcategory}</p>
                      <Link to={`/product/${it.slug}`} className="text-white font-display text-base md:text-lg hover:text-[#FF1A12] transition-colors block truncate">{it.name}</Link>
                      <p className="text-xs text-ty-textLow truncate mt-0.5">{it.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center h-10 rounded-xl border border-[#232B3A] bg-[#0F1115]">
                        <button type="button" aria-label="Diminuer la quantité" onClick={() => updateCart(it.product_id, it.quantity - 1)} className="h-10 w-10 text-white">{'\u2212'}</button>
                        <span data-testid="cart-item-qty" className="w-8 text-center text-white font-mono">{it.quantity}</span>
                        <button type="button" aria-label="Augmenter la quantité" disabled={it.quantity >= it.stock} onClick={() => updateCart(it.product_id, it.quantity + 1)} className="h-10 w-10 text-white disabled:opacity-30">+</button>
                      </div>
                      <p data-testid="cart-item-line-total" className="text-white font-mono w-24 text-right">{formatPrice(it.line_total, 'EUR', i18n.language)}</p>
                      <button onClick={() => removeFromCart(it.product_id)} data-testid="cart-item-remove-button" aria-label={t('cart.remove')} className="h-10 w-10 rounded-full border border-[#232B3A] text-ty-textMid hover:text-[#E10600] hover:border-[#E10600] flex items-center justify-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6">
                <h3 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-5">Summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-ty-textMid">{t('cart.subtotal')}</dt><dd data-testid="cart-subtotal" className="text-white font-mono">{formatPrice(subtotal, 'EUR', i18n.language)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ty-textMid">{t('cart.shipping')}</dt><dd className="text-white font-mono">{shippingFree ? <span className="text-[#F2C94C]">{t('cart.shipping_free')}</span> : formatPrice(shipping, 'EUR', i18n.language)}</dd></div>
                </dl>
                <div className="my-4 h-px bg-[#151A23]" />
                <div className="flex justify-between items-baseline">
                  <span className="text-ty-textMid">{t('cart.total')}</span>
                  <span data-testid="cart-total" className="text-white font-mono text-2xl">{formatPrice(total, 'EUR', i18n.language)}</span>
                </div>
                <button
                  type="button"
                  data-testid="cart-checkout-button"
                  className="mt-6 w-full ty-btn-primary h-12 text-xs uppercase tracking-[0.18em]"
                  onClick={startCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Redirection sécurisée…' : t('cart.checkout')} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-ty-textLow text-center">Paiement traité par Stripe. En continuant, vous acceptez nos <Link to="/legal/terms" className="underline hover:text-white">conditions de vente</Link>.</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Trust icon={<Truck className="h-4 w-4" />} label="EU SHIP" />
                  <Trust icon={<ShieldCheck className="h-4 w-4" />} label="2Y WARR" />
                  <Trust icon={<BadgeCheck className="h-4 w-4" />} label="OEM FIT" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Trust({ icon, label }) {
  return (
    <div className="rounded-lg border border-[#151A23] py-2 flex flex-col items-center text-ty-textMid">
      {icon}
      <span className="font-mono text-[10px] tracking-[0.2em] mt-1">{label}</span>
    </div>
  );
}

function EmptyCart() {
  const { t } = useTranslation();
  return (
    <div data-testid="cart-empty-state" className="py-20 text-center max-w-md mx-auto">
      <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]">// EMPTY //</p>
      <h2 className="mt-3 ty-display text-white text-3xl">{t('cart.empty')}</h2>
      <Link to="/shop" className="mt-6 inline-flex ty-btn-primary h-11 text-xs uppercase tracking-[0.18em]">{t('cart.continue')}</Link>
    </div>
  );
}
