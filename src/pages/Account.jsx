import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Account as AccountApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/format';

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!user) return;
    Promise.all([AccountApi.get(), AccountApi.orders()])
      .then(([nextProfile, nextOrders]) => { setProfile(nextProfile); setOrders(nextOrders.items || []); })
      .catch(() => setError('Impossible de charger le compte pour le moment.'));
  }, [user]);
  if (loading) return <main className="pt-32 min-h-[70vh] ty-container text-ty-textMid">Chargement du compte…</main>;
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  return <main className="pt-28 pb-24 min-h-[75vh]"><div className="ty-container">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]">// Mon TYMotors //</p><h1 className="ty-display text-white text-4xl md:text-6xl mt-3">Mon compte</h1><p className="text-ty-textMid mt-2">{user.email}</p></div><button onClick={signOut} className="ty-btn-secondary">Déconnexion</button></div>
    {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</p>}
    <div className="mt-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
      <section className="rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><h2 className="ty-display text-white text-2xl">Profil</h2>{profile ? <form className="mt-5 space-y-4" onSubmit={async (e) => {e.preventDefault(); setSaving(true); try { setProfile(await AccountApi.update({ full_name: profile.full_name || '', phone: profile.phone || '' })); } catch { setError('Enregistrement impossible.'); } finally { setSaving(false); }}}>
        <label className="block text-sm text-ty-textMid">Nom complet<input className="mt-2 h-11 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></label>
        <label className="block text-sm text-ty-textMid">Téléphone<input className="mt-2 h-11 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
        <button disabled={saving} className="ty-btn-primary w-full">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></form> : <p className="text-ty-textMid mt-5">Chargement…</p>}
        <Link to="/wishlist" className="ty-btn-secondary w-full mt-4">Mes favoris</Link>
      </section>
      <section className="rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><h2 className="ty-display text-white text-2xl">Mes commandes</h2>{orders.length === 0 ? <p className="text-ty-textMid mt-5">Aucune commande associée à ce compte.</p> : <div className="mt-5 space-y-3">{orders.map((order) => <article key={order.id} className="rounded-xl border border-[#151A23] p-4"><div className="flex justify-between gap-4"><div><p className="font-mono text-xs text-[#F2C94C]">{order.order_number}</p><p className="text-ty-textMid text-sm mt-1">{order.payment_status} · {order.fulfillment_status}</p></div><p className="text-white font-mono">{formatPrice(order.total_cents / 100, order.currency, 'fr')}</p></div></article>)}</div>}</section>
    </div>
  </div></main>;
}
