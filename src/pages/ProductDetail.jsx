import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { Heart, ShoppingBag, Truck, ShieldCheck, BadgeCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function Trust({ icon, title, sub }) {
  return (
    <div className="rounded-xl border border-[#151A23] bg-[#0A0B0E] p-3">
      <div className="flex items-center gap-2 text-white">{icon}<span className="text-xs font-medium">{title}</span></div>
      <p className="text-[11px] text-ty-textLow mt-0.5">{sub}</p>
    </div>
  );
}

function Gallery({ images, name, activeImg, setActiveImg, badges }) {
  const redBadges = new Set(['New', 'Best Seller']);
  return (
    <div>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0F1115] border border-[#151A23]">
        <img src={images?.[activeImg]} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          {badges?.map((b) => <span key={b} className={`ty-chip ${redBadges.has(b) ? 'ty-chip-red' : ''}`}>{b}</span>)}
        </div>
      </div>
      {images?.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              data-testid="product-image-thumb"
              onClick={() => setActiveImg(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border transition-colors ${activeImg === i ? 'border-[#E10600]' : 'border-[#232B3A] hover:border-[#2E394D]'}`}
            >
              <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    let cancelled = false;
    Products.get(slug)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        return Products.list({ category: p.category_slug, limit: 4 }).then((d) => {
          if (cancelled) return;
          setRelated((d.items || []).filter((x) => x.id !== p.id).slice(0, 4));
        });
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('[TYMotors] product load failed:', e?.message || e);
        if (!cancelled) setProduct(null);
      });
    return () => { cancelled = true; };
  }, [slug]);

  const onAdd = useCallback(async () => {
    if (!product) return;
    try {
      setBusy(true);
      await addToCart(product.id, qty);
      toast.success(i18n.language?.startsWith('fr') ? 'Ajout\u00e9 au panier' : 'Added to cart');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[TYMotors] add to cart failed:', err?.message || err);
      toast.error(i18n.language?.startsWith('fr') ? 'Erreur lors de l\u2019ajout' : 'Could not add to cart');
    } finally {
      setBusy(false);
    }
  }, [addToCart, i18n.language, product, qty]);

  if (!product) {
    return <main data-testid="page-product" className="pt-28 pb-24 ty-container"><p className="text-ty-textMid">{t('product.loading')}</p></main>;
  }

  const inWishlist = isInWishlist(product.id);

  return (
    <main data-testid="page-product" className="pt-28 pb-24">
      <div className="ty-container">
        <Link to="/shop" data-testid="product-back-link" className="inline-flex items-center gap-2 text-xs text-ty-textMid hover:text-white mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> <span className="tracking-[0.18em] uppercase">{t('common.explore')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Gallery images={product.images} name={product.name} activeImg={activeImg} setActiveImg={setActiveImg} badges={product.badges} />
          </div>

          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2">
              <span className="h-px w-8 bg-[#F2C94C]" /> {product.subcategory}
            </p>
            <h1 data-testid="product-title" className="ty-display text-white text-3xl md:text-5xl mt-3 leading-tight">{product.name}</h1>
            <p className="text-ty-textMid mt-2">{product.subtitle}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span data-testid="product-price" className="text-white font-mono text-3xl">{formatPrice(product.price, product.currency, i18n.language)}</span>
              {product.compare_at_price && <span className="text-ty-textLow line-through font-mono">{formatPrice(product.compare_at_price, product.currency, i18n.language)}</span>}
            </div>

            <p className="mt-6 text-ty-textMid leading-relaxed">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ty-textLow font-mono uppercase tracking-[0.18em]">{t('product.compatible_with')}:</span>
              {product.compatible_brands?.map((b) => (
                <Link key={b} to={`/brands/${b}`} className="ty-chip">{b}</Link>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center h-12 rounded-xl border border-[#232B3A] bg-[#0F1115]">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-12 text-white text-lg">{'\u2212'}</button>
                <span data-testid="product-qty" className="w-10 text-center text-white font-mono">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} className="h-12 w-12 text-white text-lg">+</button>
              </div>
              <button type="button" onClick={onAdd} disabled={busy} data-testid="product-add-to-cart-button" className="flex-1 ty-btn-primary h-12 text-xs uppercase tracking-[0.18em]">
                <ShoppingBag className="h-4 w-4" /> {t('product.add_to_cart')}
              </button>
              <button type="button" onClick={() => toggleWishlist(product.id)} data-testid="product-wishlist-button" className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-[#232B3A] text-ty-textMid hover:text-white hover:border-[#2E394D]'}`}>
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Trust icon={<Truck className="h-4 w-4" />} title="EU Shipping" sub={'Free over \u20ac350'} />
              <Trust icon={<ShieldCheck className="h-4 w-4" />} title="2y Warranty" sub="Owner-grade" />
              <Trust icon={<BadgeCheck className="h-4 w-4" />} title="OEM Fit" sub="Tested fitment" />
            </div>

            <div className="mt-10">
              <h4 className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-3">{t('product.specs')}</h4>
              <dl className="divide-y divide-[#151A23] border-y border-[#151A23]">
                {Object.entries(product.specs || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3 text-sm">
                    <dt className="text-ty-textLow">{k}</dt>
                    <dd className="text-white font-mono">{v}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-ty-textLow">{t('product.sku')}</dt>
                  <dd className="text-white font-mono">{product.sku}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="ty-display text-white text-2xl md:text-3xl mb-6">{t('product.related')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
