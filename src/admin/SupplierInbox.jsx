import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCheck, MessageSquareText, Plus, RefreshCw, Send, ShieldAlert } from 'lucide-react';
import { adminApi, errorMessage } from './api';

export default function SupplierInbox() {
  const [suppliers, setSuppliers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [direction, setDirection] = useState('outbound');
  const [form, setForm] = useState({ name: '', whatsapp_phone: '', alibaba_url: '', whatsapp_opt_in: false });
  const [showAdd, setShowAdd] = useState(false);

  const loadSuppliers = useCallback(async () => {
    try {
      const result = await adminApi.get('suppliers');
      setSuppliers(result.items || []);
      setSelected(previous => {
        if (!previous) return result.items?.[0] || null;
        return result.items?.find(item => item.id === previous.id) || null;
      });
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  const loadMessages = useCallback(async () => {
    if (!selected?.id) { setMessages([]); return; }
    try {
      const result = await adminApi.get(`suppliers/${selected.id}/messages`);
      setMessages((result.items || []).slice().reverse());
    } catch (e) { toast.error(errorMessage(e)); }
  }, [selected?.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function addSupplier(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, alibaba_url: form.alibaba_url || null };
      const supplier = await adminApi.post('suppliers', payload);
      setShowAdd(false); setSelected(supplier);
      setForm({ name: '', whatsapp_phone: '', alibaba_url: '', whatsapp_opt_in: false });
      await loadSuppliers();
      toast.success('Fournisseur ajouté');
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); }
  }

  async function setConsent(allowed) {
    if (!selected) return;
    setBusy(true);
    try {
      const supplier = await adminApi.patch(`suppliers/${selected.id}`, { whatsapp_opt_in: allowed });
      setSelected(supplier);
      await loadSuppliers();
      toast.success('Autorisation mise à jour');
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); }
  }

  async function saveMessage(event) {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    setBusy(true);
    try {
      await adminApi.post(`suppliers/${selected.id}/messages`, { body: body.trim(), channel, direction: channel === 'whatsapp' ? 'outbound' : direction });
      setBody('');
      await loadMessages();
      toast.success(channel === 'whatsapp' ? 'Brouillon enregistré : aucun message envoyé' : 'Échange Alibaba enregistré');
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); }
  }

  async function approve(id) {
    if (!window.confirm('Envoyer ce brouillon sur WhatsApp ? Vérifiez le contenu, le destinataire et le consentement.')) return;
    setBusy(true);
    try {
      await adminApi.post(`supplier-messages/${id}/approve-send`, {});
      await loadMessages();
      toast.success('Envoi confirmé par WhatsApp');
    } catch (e) { toast.error(errorMessage(e)); await loadMessages(); }
    finally { setBusy(false); }
  }

  const inWindow = !!(selected?.last_inbound_at &&
    new Date(selected.last_inbound_at).getTime() <= Date.now() &&
    Date.now() - new Date(selected.last_inbound_at).getTime() < 24 * 3600 * 1000);

  return <section className="space-y-6" data-testid="supplier-inbox">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="ad-eyebrow">SOURCING · TYMotors</p><h1 className="text-3xl font-semibold">Fournisseurs & messagerie</h1>
        <p className="ad-muted mt-2">WhatsApp : réception et brouillons approuvés. Alibaba : historique saisi manuellement.</p></div>
      <div className="flex gap-2">
        <button className="ad-btn" onClick={() => { loadSuppliers(); loadMessages(); }} aria-label="Actualiser"><RefreshCw size={17}/> Actualiser</button>
        <button className="ad-btn ad-primary" onClick={() => setShowAdd(value => !value)}><Plus size={17}/> Fournisseur</button>
      </div>
    </header>

    {showAdd && <form onSubmit={addSupplier} className="rounded-xl border border-slate-700 p-5 space-y-3">
      <h2 className="font-semibold">Ajouter un fournisseur</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label>Nom <input className="ad-input w-full" required minLength={2} maxLength={160} value={form.name} onChange={e => setForm(v => ({...v, name:e.target.value}))}/></label>
        <label>WhatsApp international <input className="ad-input w-full" placeholder="+33612345678" required value={form.whatsapp_phone} onChange={e => setForm(v => ({...v, whatsapp_phone:e.target.value}))}/></label>
        <label>Fiche Alibaba (optionnel) <input className="ad-input w-full" type="url" value={form.alibaba_url} onChange={e => setForm(v => ({...v, alibaba_url:e.target.value}))}/></label>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.whatsapp_opt_in} onChange={e => setForm(v => ({...v, whatsapp_opt_in:e.target.checked}))}/> Le fournisseur a explicitement accepté les messages WhatsApp professionnels.</label>
      <button className="ad-btn ad-primary" disabled={busy}>Enregistrer</button>
    </form>}

    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      <aside className="rounded-xl border border-slate-700 p-3 space-y-2">
        <h2 className="font-medium px-2 mb-3">Contacts ({suppliers.length})</h2>
        {loading && <p className="ad-muted p-2">Chargement…</p>}
        {!loading && !suppliers.length && <p className="ad-muted p-2">Aucun fournisseur. Ajoute ton premier contact.</p>}
        {suppliers.map(supplier => <button key={supplier.id} className={`w-full rounded-lg p-3 text-left border ${selected?.id === supplier.id ? 'border-red-500 bg-red-950/20' : 'border-transparent hover:bg-slate-800'}`} onClick={() => setSelected(supplier)}>
          <span className="block font-semibold">{supplier.name}</span>
          <span className="block ad-muted text-xs">{supplier.whatsapp_phone}</span>
        </button>)}
      </aside>

      <div className="rounded-xl border border-slate-700 p-5 min-h-[450px]">
        {!selected ? <div className="ad-empty"><MessageSquareText size={28}/><p>Sélectionne un fournisseur.</p></div> : <>
          <div className="flex justify-between gap-3 items-start border-b border-slate-700 pb-4 mb-4">
            <div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="ad-muted">{selected.whatsapp_phone}</p>
              {selected.alibaba_url && <a className="ad-link" href={selected.alibaba_url} target="_blank" rel="noreferrer">Ouvrir Alibaba ↗</a>}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(selected.whatsapp_opt_in)} disabled={busy} onChange={e => setConsent(e.target.checked)}/>
              Consentement WhatsApp vérifié
            </label>
          </div>

          <div className="flex gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 mb-4 text-sm">
            <ShieldAlert size={19} className="shrink-0"/> {inWindow ? 'Fenêtre de réponse WhatsApp ouverte (24 heures depuis le dernier message).' : 'Pas de fenêtre WhatsApp de 24 heures : envoi libre bloqué.'}
          </div>

          <div className="space-y-3 mb-5 max-h-[470px] overflow-y-auto" aria-live="polite">
            {!messages.length && <p className="ad-muted py-8 text-center">Aucun échange enregistré.</p>}
            {messages.map(msg => <article key={msg.id} className={`rounded-lg p-3 border ${msg.direction === 'outbound' ? 'border-red-900 bg-red-950/10' : 'border-slate-700 bg-slate-900/40'}`}>
              <div className="flex flex-wrap justify-between gap-2 items-center mb-2 text-xs ad-muted">
                <span>{msg.channel === 'alibaba' ? 'Alibaba (manuel)' : 'WhatsApp'} · {msg.direction === 'outbound' ? 'Sortant' : 'Entrant'} · {msg.status}</span>
                <time>{msg.created_at ? new Date(msg.created_at).toLocaleString('fr-FR') : ''}</time>
              </div>
              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              {msg.channel === 'whatsapp' && msg.status === 'draft' && <button className="ad-btn ad-primary mt-3" disabled={busy || !selected.whatsapp_opt_in || !inWindow} onClick={() => approve(msg.id)}>
                <Send size={15}/> Valider et envoyer
              </button>}
              {msg.status === 'sent' && <span className="ad-muted flex items-center gap-1 text-xs mt-2"><CheckCheck size={15}/> Accepté par Meta, livraison non garantie</span>}
              {msg.status === 'failed' && <p className="text-amber-400 text-xs mt-2">État incertain : vérifier WhatsApp avant toute nouvelle tentative.</p>}
            </article>)}
          </div>

          <form onSubmit={saveMessage} className="space-y-3 border-t border-slate-700 pt-4">
            <div className="flex flex-wrap gap-3">
              <label>Canal <select className="ad-input" value={channel} onChange={e => {setChannel(e.target.value);setDirection('outbound');}}><option value="whatsapp">WhatsApp</option><option value="alibaba">Alibaba (manuel)</option></select></label>
              {channel === 'alibaba' && <label>Sens <select className="ad-input" value={direction} onChange={e => setDirection(e.target.value)}><option value="outbound">Message envoyé</option><option value="inbound">Réponse reçue</option></select></label>}
            </div>
            <label className="block">Message<textarea className="ad-input w-full mt-1 min-h-[120px]" maxLength={4000} value={body} onChange={e => setBody(e.target.value)} placeholder={channel === 'whatsapp' ? 'Rédiger un brouillon en anglais…' : 'Coller ici le message ou la réponse Alibaba…'}/></label>
            <button className="ad-btn ad-primary" type="submit" disabled={busy || !body.trim()}>{channel === 'whatsapp' ? 'Enregistrer le brouillon' : 'Ajouter à l’historique'}</button>
            <p className="ad-muted text-xs">Aucun envoi automatique. Chaque message WhatsApp nécessite une validation ; Alibaba n'est pas connecté à sa messagerie.</p>
          </form>
        </>}
      </div>
    </div>
  </section>;
}
