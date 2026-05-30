import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

const RED_BADGES = new Set(['New', 'Best Seller']);

function ProductBadges({ badges }) {
  if (!badges?.length) return null;
  return (
    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
      {badges.slice(0, 2).map((b) => (
        <span key={b} className={`ty-chip ${RED_BADGES.has(b) ? 'ty-chip-red' : ''}`}>{b}</span>
      ))}
    </div>
  );
}

function WishlistButton({ active, onClick, label }) {
  const base = 'absolute top-3 right-3 h-9 w-9 rounded-full border border-[#232B3A] backdrop-blur flex items-center justify-center transition-all';
  const activeCls = 'bg-[#E10600] border-[#E10600] text-white';
  const idleCls = 'bg-black/50 text-ty-textMid hover:text-white hover:border-[#2E394D]';
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="product-card-wishlist-button"
      aria-label={label}
      aria-pressed={active}
      className={`${base} ${active ? activeCls : idleCls}`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-white' : ''}`} />
    </button>
  );
}

function QuickAddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="product-card-add-to-cart-button"
      className="absolute bottom-3 right-3 h-10 px-3 rounded-xl bg-[#E10600] hover:bg-[#FF1A12] text-white flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
    >
      <ShoppingBag className="h-4 w-4" /> {label}
    </button>
  );
}

function ProductImages({ img, imgHover, alt }) {
  return (
    <>
      {img && (
        <img
          src={img}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.05] group-hover:opacity-0"
        />
      )}
      {imgHover && (
        <img
          src={imgHover}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700 scale-[1.05] opacity-0 group-hover:opacity-100 group-hover:scale-100"
        />
      )}
    </>
  );
}

export function ProductCard({ product, index = 0 }) {
  const { t, i18n } = useTranslation();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.id);

  const img = product.images?.[0];
  const imgHover = product.images?.[1] || product.images?.[0];

  const onAdd = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await addToCart(product.id, 1);
        toast.success(i18n.language?.startsWith('fr') ? 'Ajout\u00e9 au panier' : 'Added to cart');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[TYMotors] add-to-cart failed:', err?.message || err);
        toast.error(i18n.language?.startsWith('fr') ? 'Erreur lors de l\u2019ajout' : 'Could not add to cart');
      }
    },
    [addToCart, product.id, i18n.language]
  );

  const onWish = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await toggleWishlist(product.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[TYMotors] wishlist toggle failed:', err?.message || err);
        toast.error(i18n.language?.startsWith('fr') ? 'Erreur favoris' : 'Wishlist error');
      }
    },
    [toggleWishlist, product.id, i18n.language]
  );

  return (
    <Link
      to={`/product/${product.slug}`}
      data-testid="product-card"
      className="group relative block bg-[#0F1115] border border-[#151A23] rounded-2xl overflow-hidden hover:border-[#2E394D] transition-colors"
      style={{ transitionDelay: `${(index % 8) * 30}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden ty-sweep">
        <ProductImages img={img} imgHover={imgHover} alt={product.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-80 pointer-events-none" />
        <ProductBadges badges={product.badges} />
        <WishlistButton active={inWishlist} onClick={onWish} label={t('product.wishlist')} />
        <QuickAddButton onClick={onAdd} label={t('product.add_to_cart')} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F2C94C]/40 to-transparent" />
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <p
            className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#F2C94C]/80"
            data-testid="product-card-subcategory"
          >
            {product.subcategory}
          </p>
          <div className="flex items-center gap-1">
            {product.compatible_brands?.slice(0, 3).map((b) => (
              <span
                key={b}
                className="font-mono text-[9px] tracking-[0.18em] uppercase text-ty-textLow border border-[#232B3A] px-1.5 py-0.5 rounded"
              >
                {b.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
        <h3
          data-testid="product-card-title"
          className="mt-2 text-base md:text-lg font-display font-medium text-white leading-snug group-hover:text-[#FF1A12] transition-colors"
        >
          {product.name}
        </h3>
        <p className="text-xs text-ty-textLow mt-0.5 truncate">{product.subtitle}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span data-testid="product-card-price" className="text-white font-mono text-base">
              {formatPrice(product.price, product.currency, i18n.language)}
            </span>
            {product.compare_at_price && (
              <span className="text-ty-textLow font-mono text-xs line-through">
                {formatPrice(product.compare_at_price, product.currency, i18n.language)}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#8E97A6]">{product.sku}</span>
        </div>
      </div>
    </Link>
  );
}
