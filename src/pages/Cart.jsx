import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { productPhoto } from '@/lib/productPhoto';
import { Trash2, ArrowRight, Truck, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { Checkout } from '@/lib/api';
import { toast } from 'sonner';
import DeliveryForm from '@/components/cart/DeliveryForm';
import useCartQuote from '@/hooks/useCartQuote';
import { quoteRequired } from '@/lib/cartQuote';

export default function Cart() {
  const { t, i18n } = useTranslation();
  const { cart, updateCart, removeFromCart } = useApp();
  const [checkingOut, setCheckingOut] = useState(false);
  const checkoutLock = useRef(false);
  const delivery = useCartQuote(cart);
  const requiresQuote = quoteRequired(cart);
  const verifiedQuote = requiresQuote ? delivery.quote : null;

  const currency = verifiedQuote?.currency || cart.currency || 'EUR';
  const subtotal = verifiedQuote ? verifiedQuote.subtotal_cents / 100 : cart.subtotal ?? 0;
  const shippingPending = verifiedQuote ? false : requiresQuote || cart.shipping_status === 'requires_quote' ||
    (cart.shipping !== undefined && (typeof cart.shipping !== 'number' || !Number.isFinite(cart.shipping)));
  const shipping = verifiedQuote ? verifiedQuote.shipping_cents / 100 : shippingPending ? null : cart.shipping ?? 0;
  const shippingFree = !shippingPending && shipping === 0;
  const totalPending = verifiedQuote ? false : shippingPending ||
    (cart.total !== undefined && (typeof cart.total !== 'number' || !Number.isFinite(cart.total)));
  const total = verifiedQuote ? verifiedQuote.total_cents / 100 : totalPending ? null : cart.total ?? (subtotal + shipping);
  const checkoutBlocked = requiresQuote ? !delivery.ready : cart.checkout_available === false || shippingPending || totalPending;

  const mutateCart = async action => {
    delivery.invalidate();
    try { await action(); }
    catch { toast.error('Impossible de modifier le panier. Vérifiez son contenu avant de poursuivre.'); }
  };

  const startCheckout = async () => {
    if (checkoutBlocked || checkingOut || checkoutLock.current) return;
    checkoutLock.current = true;
    try {
      setCheckingOut(true);
      if (requiresQuote) {
        const url = await delivery.checkout();
        if (url) window.location.assign(url);
        setCheckingOut(false);
        return;
      }
      const data = await Checkout.create();
      if (!data.url) throw new Error('missing_checkout_url');
      window.location.assign(data.url);
    } catch (error) {
      const message = error?.response?.data?.detail;
      toast.error(message || (i18n.language?.startsWith('fr') ? 'Le paiement est momentanément indisponible.' : 'Checkout is temporarily unavailable.'));
      setCheckingOut(false);
    } finally {
      // Quoted payment failures remain locked inside useCartQuote until review.
      // The legacy test path retains its existing retry behaviour.
      checkoutLock.current = false;
    }
  };

  return (
    <main data-testid="page-cart" className="pt-28 pb-24">
      <div className="ty-container">
        <Reveal className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
            <span className="h-px w-8 bg-[#F2C94C]" /> Commande
          </p>
          <h1 className="mt-3 ty-display text-white text-4xl md:text-6xl">{t('cart.title')}</h1>
        </Reveal>

        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <ul className="divide-y divide-[#151A23] border-y border-[#151A23]">
                {cart.items.map((it) => {
                  const compatibilityStatus = it.compatibility_result?.status || it.selected_vehicle?.compatibility_status;
                  const lineTotal = it.line_total ?? ((it.price || 0) * it.quantity);
                  return (
                  <li key={it.cart_item_id || it.product_id} data-testid="cart-item" className="py-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link to={`/product/${it.slug}`} className="h-24 w-24 rounded-xl overflow-hidden bg-[#0F1115] border border-[#151A23] shrink-0">
                      <CartImage key={it.images?.[0] || it.image || it.product_id} item={it} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#F2C94C]/80">{it.subcategory}</p>
                      <Link to={`/product/${it.slug}`} className="text-white font-display text-base md:text-lg hover:text-[#FF1A12] transition-colors block truncate">{it.name}</Link>
                      <p className="text-xs text-ty-textLow truncate mt-0.5">{it.subtitle}</p>
                      {it.selected_vehicle && (
                        <p className="mt-1 text-xs text-[#F2C94C]">
                          Véhicule : {[it.selected_vehicle.brand_slug, it.selected_vehicle.model, it.selected_vehicle.chassis, it.selected_vehicle.year].filter(Boolean).join(' · ')}
                          {' '}({compatibilityStatus === 'compatible' ? 'vérifié' : 'contrôle requis'})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center h-10 rounded-xl border border-[#232B3A] bg-[#0F1115]">
                        <button type="button" aria-label="Diminuer la quantité" onClick={() => mutateCart(() => updateCart(it.product_id, it.quantity - 1, it.cart_item_id))} className="h-10 w-10 text-white">{'\u2212'}</button>
                        <span data-testid="cart-item-qty" className="w-8 text-center text-white font-mono">{it.quantity}</span>
                        <button type="button" aria-label="Augmenter la quantité" disabled={it.quantity >= (it.max_order_quantity ?? Math.min(it.stock, 20))} onClick={() => mutateCart(() => updateCart(it.product_id, it.quantity + 1, it.cart_item_id))} className="h-10 w-10 text-white disabled:opacity-30">+</button>
                      </div>
                      <p data-testid="cart-item-line-total" className="text-white font-mono w-24 text-right">{formatPrice(lineTotal, currency, i18n.language)}</p>
                      <button onClick={() => mutateCart(() => removeFromCart(it.product_id, it.cart_item_id))} data-testid="cart-item-remove-button" aria-label={t('cart.remove')} className="h-10 w-10 rounded-full border border-[#232B3A] text-ty-textMid hover:text-[#E10600] hover:border-[#E10600] flex items-center justify-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
              {requiresQuote && <DeliveryForm delivery={delivery} language={i18n.language} />}
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6">
                <h3 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-5">Récapitulatif</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-ty-textMid">{t('cart.subtotal')}</dt><dd data-testid="cart-subtotal" className="text-white font-mono">{formatPrice(subtotal, currency, i18n.language)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ty-textMid">{t('cart.shipping')}</dt><dd data-testid="cart-shipping" className="text-white font-mono">{shippingPending ? 'À calculer' : shippingFree ? <span className="text-[#F2C94C]">{t('cart.shipping_free')}</span> : formatPrice(shipping, currency, i18n.language)}</dd></div>
                </dl>
                <div className="my-4 h-px bg-[#151A23]" />
                <div className="flex justify-between items-baseline">
                  <span className="text-ty-textMid">{t('cart.total')}</span>
                  <span data-testid="cart-total" className="text-white font-mono text-2xl">{totalPending ? 'À confirmer' : formatPrice(total, currency, i18n.language)}</span>
                </div>
                <button
                  type="button"
                  data-testid="cart-checkout-button"
                  className="mt-6 w-full ty-btn-primary h-12 text-xs uppercase tracking-[0.18em]"
                  onClick={startCheckout}
                  disabled={checkingOut || checkoutBlocked}
                >
                  {checkingOut ? 'Redirection sécurisée…' : t('cart.checkout')} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-ty-textLow text-center">Paiement Stripe en environnement de test : aucune carte réelle ne doit être utilisée. En continuant, vous acceptez nos <Link to="/legal/terms" className="underline hover:text-white">conditions de vente</Link>.</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Trust icon={<Truck className="h-4 w-4" />} label="SUIVI" />
                  <Trust icon={<ShieldCheck className="h-4 w-4" />} label="STRIPE TEST" />
                  <Trust icon={<BadgeCheck className="h-4 w-4" />} label="VÉRIFIER" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CartImage({ item }) {
  const { i18n } = useTranslation();
  const [failed, setFailed] = useState(false);
  const source = productPhoto(item.images?.[0] || item.image);
  if (!source || failed) {
    return <span role="img" aria-label={item.name} className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-ty-textLow">{i18n.language?.startsWith('fr') ? 'Image indisponible' : 'Image unavailable'}</span>;
  }
  return <img src={source} alt={item.name} decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain" />;
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
      <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]">{'// PANIER VIDE //'}</p>
      <h2 className="mt-3 ty-display text-white text-3xl">{t('cart.empty')}</h2>
      <Link to="/shop" className="mt-6 inline-flex ty-btn-primary h-11 text-xs uppercase tracking-[0.18em]">{t('cart.continue')}</Link>
    </div>
  );
}
