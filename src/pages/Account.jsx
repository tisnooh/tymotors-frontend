import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Account as AccountApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/format';

const ORDER_LABELS = { unpaid: 'Paiement en attente', paid: 'Payée', refunded: 'Remboursée', unfulfilled: 'À préparer', processing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', requires_review: 'Vérification nécessaire' };

function useOwnedValue(owner, fallback) {
  const [state, setState] = useState(null);
  const update = useCallback(value => setState({ owner, value }), [owner]);
  return [state && state.owner === owner ? state.value : fallback, update];
}

function TrackingTimeline({ order }) {
  const events = order.tracking_events || [];
  if (!events.length) return <p className="mt-4 text-sm text-ty-textLow">Le suivi détaillé apparaîtra après confirmation du paiement.</p>;
  return <div className="mt-5 space-y-0">{events.map((event, index) => <div key={event.id} className="relative grid grid-cols-[18px_1fr] gap-3 pb-5 last:pb-0"><div className="relative"><span className={`mt-1 block h-3 w-3 rounded-full border ${index === events.length - 1 ? 'border-[#E10600] bg-[#E10600]' : 'border-[#F2C94C] bg-[#0A0B0E]'}`}/>{index < events.length - 1 && <span className="absolute left-[5px] top-4 h-[calc(100%-8px)] w-px bg-[#232B3A]"/>}</div><div><p className="text-sm font-semibold text-white">{event.title}</p>{event.description && <p className="mt-1 text-xs leading-relaxed text-ty-textMid">{event.description}</p>}<time className="mt-1 block font-mono text-[10px] text-ty-textLow">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.occurred_at))}</time></div></div>)}</div>;
}

export default function Account() {
  const { orderId } = useParams();
  const { user, loading, signOut, updateEmail } = useAuth();
  const [profile, setProfile] = useOwnedValue(user?.id, null);
  const [orders, setOrders] = useOwnedValue(user?.id, []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailPrefs, setEmailPrefs] = useOwnedValue(user?.id, null);
  const [newEmail, setNewEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setError(''); setNotice('');
    Promise.allSettled([AccountApi.get(), AccountApi.orders(), AccountApi.emailPreferences()])
      .then(([nextProfile, nextOrders, nextPrefs]) => {
        if (!active) return;
        if (nextProfile.status === 'fulfilled') setProfile(nextProfile.value);
        if (nextOrders.status === 'fulfilled') setOrders(nextOrders.value.items || []);
        if (nextPrefs.status === 'fulfilled') setEmailPrefs(nextPrefs.value);
        if ([nextProfile, nextOrders, nextPrefs].some(result => result.status === 'rejected')) {
          setError('Certaines informations du compte sont momentanément indisponibles.');
        }
      });
    return () => { active = false; };
  }, [user, setProfile, setOrders, setEmailPrefs]);
  useEffect(() => {
    if (orderId && orders.length) document.getElementById(`order-${orderId}`)?.scrollIntoView({ block: 'center' });
  }, [orderId, orders]);
  if (loading) return <main className="pt-32 min-h-[70vh] ty-container text-ty-textMid">Chargement du compte…</main>;
  if (!user) return <Navigate to="/auth?mode=login" replace />;
  return <main className="pt-28 pb-24 min-h-[75vh]"><div className="ty-container">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]">{'// Mon TYMotors //'}</p><h1 className="ty-display text-white text-4xl md:text-6xl mt-3">Mon compte</h1><p className="text-ty-textMid mt-2">{user.email}</p></div><button onClick={signOut} className="ty-btn-secondary">Déconnexion</button></div>
    {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</p>}
    {notice && <p className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100">{notice}</p>}
    <div className="mt-10 grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
      <section className="rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><h2 className="ty-display text-white text-2xl">Profil</h2>{profile ? <form className="mt-5 space-y-4" onSubmit={async (e) => {e.preventDefault(); setSaving(true); try { setProfile(await AccountApi.update({ full_name: profile.full_name || '', phone: profile.phone || '' })); } catch { setError('Enregistrement impossible.'); } finally { setSaving(false); }}}>
        <label className="block text-sm text-ty-textMid">Nom complet<input className="mt-2 h-11 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></label>
        <label className="block text-sm text-ty-textMid">Téléphone<input className="mt-2 h-11 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
        <button disabled={saving} className="ty-btn-primary w-full">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></form> : <p className="text-ty-textMid mt-5">Chargement…</p>}
        <Link to="/wishlist" className="ty-btn-secondary w-full mt-4">Mes favoris</Link>
      </section>
      <section className="rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><h2 className="ty-display text-white text-2xl">Mes commandes</h2>{orders.length === 0 ? <p className="text-ty-textMid mt-5">Aucune commande associée à ce compte.</p> : <div className="mt-5 space-y-3">{orders.map((order) => <article id={`order-${order.id}`} key={order.id} className={`rounded-xl border p-4 ${order.id === orderId ? 'border-[#E10600]' : 'border-[#151A23]'}`}><div className="flex justify-between gap-4"><div><p className="font-mono text-xs text-[#F2C94C]">{order.order_number}</p><p className="text-ty-textMid text-sm mt-1">{ORDER_LABELS[order.payment_status] || order.payment_status} · {ORDER_LABELS[order.fulfillment_status] || order.fulfillment_status}</p></div><p className="text-white font-mono">{formatPrice(order.total_cents / 100, order.currency, 'fr')}</p></div><TrackingTimeline order={order}/>{order.tracking_url && <a className="ty-btn-secondary mt-5 w-full" href={order.tracking_url} target="_blank" rel="noreferrer">Suivre chez le transporteur</a>}</article>)}</div>}</section>
    </div>
    <section className="mt-6 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><h2 className="ty-display text-white text-2xl">Préférences email</h2><p className="text-sm text-ty-textMid mt-2">Les emails indispensables à vos commandes et à la sécurité du compte restent actifs.</p>
      <label className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#151A23] p-4 text-white"><span><strong>Newsletter TYMotors</strong><small className="block text-ty-textLow mt-1">Nouveautés, sélections et offres.</small></span><input type="checkbox" checked={Boolean(emailPrefs?.newsletter)} disabled={!emailPrefs || savingEmail} onChange={async (e) => { const enabled = e.target.checked; setSavingEmail(true); setError(''); try { const next = await AccountApi.updateEmailPreferences(enabled); setEmailPrefs(next); setNotice(enabled ? 'Vérifiez votre boîte mail pour confirmer l’inscription.' : 'Vous êtes désinscrit de la newsletter.'); } catch { setError('Impossible de modifier la préférence newsletter.'); } finally { setSavingEmail(false); } }} className="h-5 w-5 accent-[#E10600]" /></label>
      <form className="mt-6 border-t border-[#151A23] pt-5" onSubmit={async (e) => { e.preventDefault(); setSavingEmail(true); setError(''); setNotice(''); try { await updateEmail(newEmail); setNotice('Un lien de confirmation a été envoyé à votre nouvelle adresse.'); setNewEmail(''); } catch (err) { setError(err?.message || 'Impossible de modifier votre adresse email.'); } finally { setSavingEmail(false); } }}><label className="block text-sm text-ty-textMid">Nouvelle adresse email<input required type="email" autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label><button disabled={savingEmail} className="ty-btn-secondary mt-4">CONFIRMER LE CHANGEMENT</button></form>
    </section>
  </div></main>;
}
