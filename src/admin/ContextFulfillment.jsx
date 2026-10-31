import React, { useRef, useState } from 'react';
import { adminApi, date, errorMessage } from './api';
import { Badge, Field, LoadState, Panel, useData } from './ui';

const steps = { requires_review: ['supplier_confirmed', 'Confirmer la référence fournisseur'],
  supplier_confirmed: ['shipped', 'Enregistrer l’expédition'], shipped: ['delivered', 'Enregistrer la livraison'] };
const plain = (value, min, max) => typeof value === 'string' && value.trim().length >= min
  && value.trim().length <= max && !Array.from(value).some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127);

function Task({ task, order, reload }) {
  const [reference, setReference] = useState(task.supplier_order_ref || '');
  const [tracking, setTracking] = useState(task.tracking_number || '');
  const [carrier, setCarrier] = useState(task.carrier || '');
  const [link, setLink] = useState(task.tracking_url || '');
  const [evidence, setEvidence] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false), [attempted, setAttempted] = useState(false);
  const [error, setError] = useState(''), [draft, setDraft] = useState(null);
  const active = useRef(true), inFlight = useRef(false), writeAttempted = useRef(false);
  React.useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const step = steps[task.state], next = step?.[0];
  const production = order.is_test === false && task.is_test === false;
  const financialHold = order.payment_status !== 'paid' || ['cancelled', 'refunded'].includes(order.status)
    || order.fulfillment_status === 'cancelled' || order.financial_review_required || order.refunded_amount_cents > 0;
  const shippingHold = next === 'shipped' && (order.requires_compatibility_review || !order.stock_applied_at
    || (task.review_reasons || []).some(reason => reason !== 'fulfillment_approval_required'));
  const blocked = !production || !step || (next !== 'delivered' && financialHold) || shippingHold;
  const locked = busy || attempted || blocked;
  async function loadDraft() {
    if (!production || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const value = await adminApi.get(`commerce/context/tasks/${task.id}/supplier-draft`);
      if (!active.current) return;
      if (value?.task_id !== task.id || value.order_id !== order.id || value.status !== 'draft_not_transmitted'
          || value.external_send_allowed !== false) throw new Error('Brouillon fournisseur non vérifiable.');
      setDraft(value);
    } catch (failure) { if (active.current) setError(errorMessage(failure)); }
    finally { inFlight.current = false; if (active.current) setBusy(false); }
  }
  async function advance(event) {
    event.preventDefault();
    if (blocked || inFlight.current || writeAttempted.current) return;
    if (!plain(evidence, 3, 1000) || (next === 'supplier_confirmed' && (!reviewed || !plain(reference, 1, 200)))) {
      setError('Renseignez une preuve identifiable et confirmez la vérification technique de ce dossier.'); return;
    }
    if (next === 'shipped') {
      let url;
      try { url = new URL(link); } catch { /* rejected below */ }
      if (!plain(tracking, 1, 120) || /^SIM-/i.test(tracking.trim()) || !plain(carrier, 1, 100)
          || !url || url.protocol !== 'https:' || url.username || url.password || link.length > 1000) {
        setError('Renseignez le transporteur, le vrai numéro de suivi et son lien HTTPS.'); return;
      }
    }
    // A lost response may follow an accepted write. Reload the server version
    // before another action; never rotate a CAS token or retry automatically.
    inFlight.current = true; writeAttempted.current = true; setBusy(true); setAttempted(true); setError('');
    try {
      const result = await adminApi.post(`commerce/context/tasks/${task.id}/advance`, {
        expected_updated_at: task.updated_at, next, evidence_ref: evidence.trim(),
        supplier_order_ref: next === 'supplier_confirmed' ? reference.trim() : null,
        tracking_number: next === 'shipped' ? tracking.trim() : null,
        carrier: next === 'shipped' ? carrier.trim() : null,
        tracking_url: next === 'shipped' ? link.trim() : null,
      });
      if (!active.current) return;
      if (result?.task_id !== task.id || result.order_id !== order.id || result.task_state !== next
          || typeof result.updated !== 'boolean') throw new Error('Résultat non vérifiable. Rechargez le dossier.');
      reload();
    } catch (failure) { if (active.current) setError(`${errorMessage(failure)} Rechargez le dossier avant toute nouvelle action.`); }
    finally { inFlight.current = false; if (active.current) setBusy(false); }
  }
  return <Panel title={`Dossier fournisseur · ${task.supplier_sku}`}>
    <p><Badge value={task.state}/> · Quantité : {task.quantity} · Version : {date(task.updated_at)}</p>
    <p className="ad-note">Fournisseur : {task.snapshot?.supplier?.name || task.supplier_id} · Agent : {task.snapshot?.agent?.name || task.agent_id}</p>
    <p className="ad-note">Variante : {task.variant_id} · Groupe : {task.group_key}</p>
    {(task.review_reasons || []).length > 0 && <p className="ad-note">Contrôles : {task.review_reasons.join(' · ')}</p>}
    <details><summary>Références et conditions enregistrées à la commande</summary><pre className="ad-json">{JSON.stringify(task.snapshot, null, 2)}</pre></details>
    <p className="ad-note">Ces actions enregistrent des preuves obtenues manuellement. Elles ne transmettent aucune commande et ne déclenchent aucun achat.</p>
    {production && <button className="ad-btn" type="button" disabled={busy} onClick={loadDraft}>Préparer le dossier fournisseur sans envoi</button>}
    {draft && <div><p className="ad-note">Brouillon non transmis · aucun envoi externe autorisé.</p><pre className="ad-json">{JSON.stringify(draft, null, 2)}</pre></div>}
    {!production && <p className="ad-alert">Commande de test : aucune confirmation fournisseur ni expédition réelle autorisée.</p>}
    {production && blocked && step && <p className="ad-alert">Traitement bloqué par un contrôle de paiement, de stock ou de compatibilité. Le serveur doit confirmer l’éligibilité.</p>}
    {step ? <form className="ad-form-grid" onSubmit={advance}>
      <Field label="Référence exacte de commande fournisseur" value={reference} onChange={e => setReference(e.target.value)} required={next === 'supplier_confirmed'} readOnly={next !== 'supplier_confirmed'} disabled={locked} maxLength={200}/>
      {next !== 'supplier_confirmed' && <>
        <Field label="Transporteur du colis" value={carrier} onChange={e => setCarrier(e.target.value)} required readOnly={next === 'delivered'} disabled={locked} maxLength={100}/>
        <Field label="Numéro de suivi du colis" value={tracking} onChange={e => setTracking(e.target.value)} required readOnly={next === 'delivered'} disabled={locked} maxLength={120}/>
        <Field label="Lien HTTPS de suivi du colis" type="url" value={link} onChange={e => setLink(e.target.value)} required readOnly={next === 'delivered'} disabled={locked} maxLength={1000}/>
      </>}
      <Field label={next === 'supplier_confirmed' ? 'Preuve de référence, variante et compatibilité' : next === 'shipped' ? 'Preuve d’expédition du colis' : 'Preuve de livraison du colis'} value={evidence} onChange={e => setEvidence(e.target.value)} required minLength={3} maxLength={1000} disabled={locked}/>
      {next === 'supplier_confirmed' && <Field label="Vérification technique"><span><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} required disabled={locked}/> J’ai vérifié la référence, la variante et la compatibilité du véhicule à partir de la preuve indiquée.</span></Field>}
      <div className="ad-actions"><button className="ad-btn ad-primary" disabled={locked}>{busy ? 'Enregistrement…' : step[1]}</button><button className="ad-btn" type="button" disabled={busy} onClick={reload}>Recharger le dossier</button></div>
    </form> : <p className="ad-note">{task.state === 'delivered' ? 'Livraison enregistrée. Les preuves et le suivi restent conservés.' : 'Étape inconnue : revue nécessaire.'}</p>}
    {error && <p className="ad-alert" role="alert">{error}</p>}
    {task.supplier_evidence_ref && <p className="ad-note">Preuve fournisseur : {task.supplier_evidence_ref}</p>}
    {task.shipment_evidence_ref && <p className="ad-note">Preuve d’expédition : {task.shipment_evidence_ref}</p>}
    {task.delivery_evidence_ref && <p className="ad-note">Preuve de livraison : {task.delivery_evidence_ref}</p>}
  </Panel>;
}

export default function ContextFulfillment({ order, reloadOrder }) {
  const state = useData(`commerce/context/orders/${order.id}/tasks`);
  const reload = () => { state.reload(); reloadOrder(); };
  return <LoadState state={state}>{data => {
    if (!Array.isArray(data?.items) || data.items.length > 100 || data.items.some(task => !task.id
        || task.order_id !== order.id || typeof task.is_test !== 'boolean' || !task.updated_at
        || !Number.isFinite(Date.parse(task.updated_at))) || new Set(data.items.map(task => task.id)).size !== data.items.length) {
      return <Panel title="Dossiers fournisseurs"><p className="ad-alert">Dossiers non vérifiables. Rechargez la commande.</p><button className="ad-btn" onClick={reload}>Recharger la commande</button></Panel>;
    }
    return data.items.length ? data.items.map(task => <Task key={`${task.id}:${task.updated_at}`} task={task} order={order} reload={reload}/>)
      : <Panel title="Dossiers fournisseurs"><p className={order.payment_status === 'paid' && order.is_test === false ? 'ad-alert' : 'ad-note'}>Aucun dossier fournisseur enregistré pour cette commande. Aucun traitement automatique n’est déclenché.</p></Panel>;
  }}</LoadState>;
}
