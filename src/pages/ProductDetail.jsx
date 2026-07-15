import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Products } from '@/lib/api';
import { ProductCard } from '@/components/shared/ProductCard';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { Heart, ShoppingBag, Truck, ShieldCheck, BadgeCheck, ArrowLeft, AlertTriangle } from 'lucide-react';
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
              aria-label={`${name} — image ${i + 1}`}
              aria-pressed={activeImg === i}
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

function CompatibilityChecker({ product, onSelection }) {
  const detailed = product.compatibilities || [];
  const brands = [...new Set([...detailed.map((item) => item.brand_slug), ...(product.compatible_brands || [])])];
  const [vehicle, setVehicle] = useState({ brand_slug: '', model: '', chassis: '', year: '' });
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const models = [...new Set(detailed.filter((item) => item.brand_slug === vehicle.brand_slug).map((item) => item.model))];
  const chassis = [...new Set(detailed.filter((item) => item.brand_slug === vehicle.brand_slug && item.model === vehicle.model).map((item) => item.chassis))];

  const update = (key, value) => {
    setResult(null);
    onSelection?.(null, null);
    setVehicle((current) => ({
      ...current,
      [key]: value,
      ...(key === 'brand_slug' ? { model: '', chassis: '', year: '' } : {}),
      ...(key === 'model' ? { chassis: '', year: '' } : {}),
    }));
  };

  const check = async () => {
    if (!vehicle.brand_slug) return;
    setChecking(true);
    try {
      const data = await Products.checkCompatibility(product.slug, {
        ...vehicle,
        year: vehicle.year ? Number(vehicle.year) : null,
      });
      setResult(data);
      onSelection?.({ ...vehicle, year: vehicle.year ? Number(vehicle.year) : null }, data.status);
    } catch (error) {
      setResult({ status: 'unknown', reason: 'La vérification est indisponible. Contactez-nous avant de commander.' });
    } finally {
      setChecking(false);
    }
  };

  const messages = {
    compatible: { label: 'Compatible', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
    incompatible: { label: 'Non compatible', className: 'border-red-500/40 bg-red-500/10 text-red-200' },
    confirm: { label: 'Compatibilité à confirmer', className: 'border-amber-500/40 bg-amber-500/10 text-amber-100' },
    unknown: { label: 'Informations insuffisantes', className: 'border-slate-500/40 bg-slate-500/10 text-slate-200' },
  };
  const display = result ? messages[result.status] || messages.unknown : null;

  return (
    <section className="mt-7 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-4" aria-labelledby="compatibility-title">
      <div className="flex items-start gap-3">
        <BadgeCheck className="h-5 w-5 text-[#F2C94C] mt-0.5" />
        <div>
          <h2 id="compatibility-title" className="text-white font-medium">Ce produit convient-il à mon véhicule ?</h2>
          <p className="text-xs text-ty-textLow mt-1">Nous ne confirmons une compatibilité que lorsque les données du véhicule sont suffisantes et vérifiées.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        <select aria-label="Marque du véhicule" value={vehicle.brand_slug} onChange={(event) => update('brand_slug', event.target.value)} className="h-11 rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white">
          <option value="">Marque</option>
          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <select aria-label="Modèle du véhicule" value={vehicle.model} onChange={(event) => update('model', event.target.value)} disabled={!models.length} className="h-11 rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white disabled:opacity-50">
          <option value="">{models.length ? 'Modèle' : 'Modèle non documenté'}</option>
          {models.map((model) => <option key={model} value={model}>{model}</option>)}
        </select>
        <select aria-label="Châssis du véhicule" value={vehicle.chassis} onChange={(event) => update('chassis', event.target.value)} disabled={!chassis.length} className="h-11 rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white disabled:opacity-50">
          <option value="">{chassis.length ? 'Génération / châssis' : 'Châssis non documenté'}</option>
          {chassis.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <input aria-label="Année du véhicule" type="number" min="1980" max="2035" placeholder="Année" value={vehicle.year} onChange={(event) => update('year', event.target.value)} className="h-11 rounded-lg border border-[#232B3A] bg-[#0F1115] px-3 text-sm text-white" />
      </div>
      <button type="button" onClick={check} disabled={!vehicle.brand_slug || checking} className="mt-3 ty-btn-line h-10 w-full text-xs uppercase tracking-[0.16em] disabled:opacity-40">
        {checking ? 'Vérification…' : 'Vérifier la compatibilité'}
      </button>
      {display && (
        <div className={`mt-3 rounded-xl border p-3 text-sm ${display.className}`} role="status">
          <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />{display.label}</div>
          <p className="mt-1 text-xs opacity-80">{result.reason}</p>
        </div>
      )}
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [compatibilityStatus, setCompatibilityStatus] = useState(null);

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setSelectedVehicle(null);
    setCompatibilityStatus(null);
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

  useEffect(() => {
    if (!product) return undefined;
    const description = `${product.name} — ${product.subtitle}. ${product.description}`.slice(0, 160);
    const canonicalUrl = `${window.location.origin}/product/${product.slug}`;
    document.title = `${product.name} | TYMotors`;

    const upsertMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }
      Object.entries(attribute).forEach(([key, val]) => element.setAttribute(key, val));
      element.setAttribute('content', value);
    };
    upsertMeta('meta[name="description"]', { name: 'description' }, description);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, `${product.name} | TYMotors`);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, product.images?.[0] || '');
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'product');
    upsertMeta(
      'meta[name="robots"]',
      { name: 'robots' },
      process.env.REACT_APP_SITE_MODE === 'production'
        ? 'index,follow,max-image-preview:large'
        : 'noindex,nofollow',
    );

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.tymotorsProduct = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images || [],
      sku: product.sku,
      brand: { '@type': 'Brand', name: 'TYMotors' },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: product.currency || 'EUR',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    });
    document.head.appendChild(schema);

    return () => schema.remove();
  }, [product]);

  const onAdd = useCallback(async () => {
    if (!product) return;
    try {
      setBusy(true);
      await addToCart(product.id, qty, selectedVehicle);
      toast.success(i18n.language?.startsWith('fr') ? 'Ajout\u00e9 au panier' : 'Added to cart');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[TYMotors] add to cart failed:', err?.message || err);
      toast.error(i18n.language?.startsWith('fr') ? 'Erreur lors de l\u2019ajout' : 'Could not add to cart');
    } finally {
      setBusy(false);
    }
  }, [addToCart, i18n.language, product, qty, selectedVehicle]);

  const onBuyNow = useCallback(async () => {
    if (!product) return;
    try {
      setBusy(true);
      await addToCart(product.id, qty, selectedVehicle);
      navigate('/cart');
    } catch (err) {
      toast.error('Impossible de préparer la commande');
    } finally {
      setBusy(false);
    }
  }, [addToCart, navigate, product, qty, selectedVehicle]);

  if (!product) {
    return <main data-testid="page-product" className="pt-28 pb-24 ty-container"><p className="text-ty-textMid">{t('product.loading')}</p></main>;
  }

  const inWishlist = isInWishlist(product.id);
  const requiresVehicleCheck = Boolean(product.compatibilities?.length);
  const canOrder = product.stock > 0 && (!requiresVehicleCheck || ['compatible', 'confirm'].includes(compatibilityStatus));

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

            <div className="mt-3 flex items-center gap-2 text-xs" role="status">
              <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-[#E10600]'}`} />
              <span className={product.stock > 0 ? 'text-emerald-300' : 'text-red-300'}>
                {product.stock > 0 ? `${product.stock} article${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''}` : 'Rupture de stock'}
              </span>
            </div>

            <p className="mt-6 text-ty-textMid leading-relaxed">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ty-textLow font-mono uppercase tracking-[0.18em]">{t('product.compatible_with')}:</span>
              {product.compatible_brands?.map((b) => (
                <Link key={b} to={`/brands/${b}`} className="ty-chip">{b}</Link>
              ))}
            </div>

            <CompatibilityChecker product={product} onSelection={(selection, status) => { setSelectedVehicle(selection); setCompatibilityStatus(status); }} />

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center h-12 rounded-xl border border-[#232B3A] bg-[#0F1115]">
                <button type="button" aria-label={i18n.language?.startsWith('fr') ? 'Diminuer la quantité' : 'Decrease quantity'} onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-12 text-white text-lg">{'\u2212'}</button>
                <span data-testid="product-qty" className="w-10 text-center text-white font-mono">{qty}</span>
                <button type="button" aria-label={i18n.language?.startsWith('fr') ? 'Augmenter la quantité' : 'Increase quantity'} disabled={qty >= Math.min(product.stock, 20)} onClick={() => setQty((q) => Math.min(q + 1, product.stock, 20))} className="h-12 w-12 text-white text-lg disabled:opacity-30">+</button>
              </div>
              <button type="button" onClick={onAdd} disabled={busy || !canOrder} data-testid="product-add-to-cart-button" className="flex-1 ty-btn-primary h-12 text-xs uppercase tracking-[0.18em] disabled:opacity-50">
                <ShoppingBag className="h-4 w-4" /> {product.stock < 1 ? 'Indisponible' : requiresVehicleCheck && !compatibilityStatus ? 'Vérifiez votre véhicule' : t('product.add_to_cart')}
              </button>
              <button type="button" aria-label={i18n.language?.startsWith('fr') ? 'Ajouter aux favoris' : 'Add to wishlist'} aria-pressed={inWishlist} onClick={() => toggleWishlist(product.id)} data-testid="product-wishlist-button" className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-colors ${inWishlist ? 'bg-[#E10600] border-[#E10600] text-white' : 'border-[#232B3A] text-ty-textMid hover:text-white hover:border-[#2E394D]'}`}>
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-white' : ''}`} />
              </button>
            </div>
            <button type="button" onClick={onBuyNow} disabled={busy || !canOrder} className="mt-3 ty-btn-line h-11 w-full text-xs uppercase tracking-[0.18em] disabled:opacity-50">
              Acheter maintenant
            </button>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Trust icon={<Truck className="h-4 w-4" />} title="Expédition" sub="Suivi inclus" />
              <Trust icon={<ShieldCheck className="h-4 w-4" />} title="Paiement sécurisé" sub="Stripe en mode test" />
              <Trust icon={<BadgeCheck className="h-4 w-4" />} title="Compatibilité" sub="Vérification avant achat" />
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

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-[#151A23] bg-[#0A0B0E] p-4">
                <h3 className="text-white font-medium">Installation</h3>
                <p className="mt-2 text-ty-textMid">Difficulté : {product.installation_difficulty || 'À confirmer'}</p>
                <p className="text-ty-textMid">Durée : {product.installation_minutes ? `${product.installation_minutes} min environ` : 'À confirmer'}</p>
                <p className="text-ty-textMid">Outils : {product.tools_required?.length ? product.tools_required.join(', ') : 'À confirmer'}</p>
              </div>
              <div className="rounded-xl border border-[#151A23] bg-[#0A0B0E] p-4">
                <h3 className="text-white font-medium">Livraison et garantie</h3>
                <p className="mt-2 text-ty-textMid">Délai : {product.delivery_estimate || 'À confirmer avant commande'}</p>
                <p className="text-ty-textMid">Garantie : {product.warranty_months ? `${product.warranty_months} mois` : 'Selon le produit'}</p>
                <Link to="/support/returns" className="mt-2 inline-block text-[#F2C94C] hover:text-white">Consulter les retours</Link>
              </div>
              <div className="sm:col-span-2 rounded-xl border border-[#151A23] bg-[#0A0B0E] p-4">
                <h3 className="text-white font-medium">Contenu du colis</h3>
                {product.package_contents?.length ? (
                  <ul className="mt-2 list-disc pl-5 text-ty-textMid">{product.package_contents.map((item) => <li key={item}>{item}</li>)}</ul>
                ) : <p className="mt-2 text-ty-textMid">Contenu à confirmer avant publication.</p>}
              </div>
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
