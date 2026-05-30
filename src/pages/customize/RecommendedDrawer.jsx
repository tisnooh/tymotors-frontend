import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { ProductCard } from '@/components/shared/ProductCard';
import { Reveal } from '@/components/shared/Reveal';

function LoadingSkeletons({ skeletonKeys }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {skeletonKeys.map((k) => (
        <div key={k} className="aspect-[4/5] rounded-2xl bg-[#0F1115] border border-[#151A23] animate-pulse" />
      ))}
    </div>
  );
}

export function RecommendedDrawer({ activeHotspot, loading, recommended, skeletonKeys, onClose }) {
  const { t } = useTranslation();
  if (!activeHotspot) return null;

  let body;
  if (loading) {
    body = <LoadingSkeletons skeletonKeys={skeletonKeys} />;
  } else if (recommended.length === 0) {
    body = <p className="text-ty-textMid">{t('customize.not_compatible')}</p>;
  } else {
    body = (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {recommended.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
      </div>
    );
  }

  return (
    <Reveal className="mt-10">
      <div data-testid="customize-drawer" className="rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]">
              <span className="inline-block h-px w-8 bg-[#F2C94C] align-middle mr-2" />
              {t(`customize.hotspots.${activeHotspot}`)}
            </p>
            <h3 className="mt-2 ty-display text-white text-2xl md:text-3xl">{t('customize.recommended')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="customize-drawer-close"
            className="h-10 w-10 rounded-full border border-[#232B3A] flex items-center justify-center text-ty-textMid hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">{body}</div>
      </div>
    </Reveal>
  );
}
