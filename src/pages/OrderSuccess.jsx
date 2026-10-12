import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, AlertTriangle } from 'lucide-react';
import { Checkout } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useApp } from '@/contexts/AppContext';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const { refreshCart } = useApp();

  useEffect(() => {
    if (!sessionId) {
      setError(true);
      return;
    }
    let stopped = false;
    let timer;
    let attempts = 0;
    const check = async () => {
      try {
        const data = await Checkout.get(sessionId);
        if (stopped) return;
        setOrder(data);
        if (data.paid) refreshCart();
        else if (++attempts < 15 && !['failed', 'refunded'].includes(data.payment_status)) timer = setTimeout(check, 2000);
      } catch { if (!stopped) setError(true); }
    };
    check();
    return () => { stopped = true; clearTimeout(timer); };
  }, [refreshCart, sessionId]);

  if (error) {
    return (
      <main className="pt-32 pb-24 ty-container text-center min-h-[70vh]">
        <AlertTriangle className="h-12 w-12 text-[#F2C94C] mx-auto" />
        <h1 className="ty-display text-white text-4xl mt-5">Confirmation indisponible</h1>
        <p className="text-ty-textMid mt-3">Nous n’avons pas pu vérifier cette commande. Aucun nouveau paiement n’a été déclenché.</p>
        <Link to="/support/contact" className="ty-btn-primary inline-flex mt-8">Contacter le support</Link>
      </main>
    );
  }

  if (!order) {
    return <main className="pt-32 pb-24 ty-container text-center min-h-[70vh]"><LoaderCircle className="h-10 w-10 text-[#E10600] animate-spin mx-auto" /><p className="text-ty-textMid mt-4">Vérification sécurisée du paiement…</p></main>;
  }

  return (
    <main className="pt-32 pb-24 ty-container min-h-[70vh]">
      <div className="max-w-2xl mx-auto rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6 md:p-10">
        <CheckCircle2 className={`h-12 w-12 ${order.paid ? 'text-emerald-400' : 'text-[#F2C94C]'}`} />
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#F2C94C] mt-6">Commande vérifiée</p>
        <h1 className="ty-display text-white text-4xl mt-2">{order.paid ? 'Paiement confirmé' : 'Paiement en cours'}</h1>
        <p className="text-ty-textMid mt-3">{order.customer_email ? `Email de commande : ${order.customer_email}.` : 'Retrouvez votre commande dans le suivi ci-dessous.'}</p>
        <dl className="mt-8 divide-y divide-[#151A23] border-y border-[#151A23] text-sm">
          {order.items.map((item) => <div key={item.product_id} className="flex justify-between gap-4 py-3"><dt className="text-ty-textMid">{item.name} × {item.quantity}</dt><dd className="text-white font-mono">{formatPrice((item.unit_amount * item.quantity) / 100, order.currency, 'fr')}</dd></div>)}
          <div className="flex justify-between py-3"><dt className="text-ty-textMid">Livraison</dt><dd className="text-white font-mono">{order.shipping === 0 ? 'Offerte' : formatPrice(order.shipping, order.currency, 'fr')}</dd></div>
          <div className="flex justify-between py-3 text-base"><dt className="text-white">Total</dt><dd className="text-white font-mono">{formatPrice(order.total, order.currency, 'fr')}</dd></div>
        </dl>
        <p className="text-ty-textLow text-xs mt-5 break-all">Référence : {order.order_reference}</p>
        {!order.paid && <p className="text-ty-textMid text-sm mt-3">La validation attend la notification sécurisée de Stripe. Ne payez pas une seconde fois. Retrouvez ensuite votre commande dans le suivi.</p>}
        <Link to="/support/track" className="text-white underline inline-block mt-4">Suivre ma commande</Link>
        <div className="mt-8 flex flex-wrap gap-3"><Link to="/shop" className="ty-btn-primary">Continuer mes achats</Link><Link to="/support/contact" className="ty-btn-secondary">Besoin d’aide ?</Link></div>
      </div>
    </main>
  );
}
