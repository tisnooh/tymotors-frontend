import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, Euro, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, money, date, errorMessage } from './api';
import { useData, PageTitle, Badge, Field, StatusSelect, LoadState, Table, Pager, SearchBox, useFilters, DetailLink, Panel } from './ui';
import ContextFulfillment from './ContextFulfillment';
export const orderColumns = [
  { label: 'Commande', render: r => <><DetailLink to={`/admin/orders/${r.id}`}>{r.order_number}</DetailLink>{r.is_test && <small>TEST · aucune expédition</small>}</> },
  { label: 'Date', render: r => date(r.created_at) },
  { label: 'Client', render: r => <><strong>{r.customer_name || 'Client invité'}</strong><small>{r.customer_email || 'En attente du paiement'}</small></> },
  { label: 'Montant', render: r => money(r.total_cents) },
  { label: 'Paiement', render: r => <Badge value={r.payment_status}/> },
  { label: 'Statut', render: r => <Badge value={r.status}/> },
  { label: 'Livraison', render: r => <Badge value={r.fulfillment_status}/> },
  { label: 'Canal', render: r => r.sales_channel === 'website' ? 'Site TYMotors' : r.sales_channel || 'Site TYMotors' },
];

export function Dashboard() {
  const state = useData('dashboard');
  return <><PageTitle eyebrow="Vue d’ensemble" title="Le cockpit TYMotors" description="Commandes, chiffre d’affaires et points à surveiller."><Link className="ad-btn ad-primary" to="/admin/orders">Gérer les commandes<ArrowUpRight size={16}/></Link></PageTitle><LoadState state={state}>{d => <>
    <div className="ad-metrics">{[['CA net aujourd’hui', money(d.revenue.today.net), Euro], ['CA net cette semaine', money(d.revenue.week.net), Euro], ['CA net ce mois', money(d.revenue.month.net), Euro], ['Commandes à traiter', d.to_process, Clock]].map(([title, value, Icon]) => <section className="ad-metric" key={title}><div><span>{title}</span><Icon size={19}/></div><strong>{value}</strong><small>{title.includes('CA') ? 'Commandes payées · hors annulations' : 'Paiement reçu · préparation requise'}</small></section>)}</div>
    <div className="ad-metrics ad-secondary-metrics">{[['Commandes', d.order_count, ShoppingBag], ['Panier moyen net', money(d.average_cents), Euro], ['Clients', d.customer_count, Users], ['Marge brute estimée', money(d.estimated_margin_cents), Euro]].map(([title, value, Icon]) => <section className="ad-metric" key={title}><div><span>{title}</span><Icon size={17}/></div><strong>{value}</strong></section>)}</div>
    <p className="ad-note">Périodes en heure de Paris. CA brut du mois : {money(d.revenue.month.gross)} · Remboursements associés : {money(d.revenue.month.refunds)}. Les remboursements sont rattachés aux commandes de la période. La marge brute exclut frais, commandes remboursées et commandes aux coûts inconnus ({d.missing_cost_lines} ligne(s)).</p>
    <div className="ad-grid-2"><Panel title="Commandes récentes"><Table items={d.recent_orders} columns={[orderColumns[0], orderColumns[3], orderColumns[4]]}/><Link className="ad-panel-link" to="/admin/orders">Toutes les commandes <ArrowUpRight size={15}/></Link></Panel><Panel title="Stocks à surveiller"><Table items={d.low_stock} columns={[{ label: 'Produit', render: r => <DetailLink to={`/admin/products/${r.id}`}>{r.name}</DetailLink> }, { label: 'Disponible', render: r => r.stock }, { label: 'État', render: r => <Badge value={r.stock_status}/> }]}/><Link className="ad-panel-link" to="/admin/inventory">Gérer les stocks <ArrowUpRight size={15}/></Link></Panel></div>
    <Panel title="Top produits vendus"><Table items={d.top_products} columns={[{ label: 'Produit', render: r => r.product_name }, { label: 'Unités vendues', render: r => r.quantity }, { label: 'Ventes brutes avant remises', render: r => money(r.gross_cents) }]}/></Panel>
  </>}</LoadState></>;
}

export function Orders() {
  const f = useFilters(), state = useData('orders', f.params);
  return <><PageTitle title="Commandes" description="Suivez chaque commande, du paiement à la livraison."/><Panel><div className="ad-toolbar"><SearchBox value={f.q} onChange={f.setQ} placeholder="Nom, e-mail ou numéro…"/><StatusSelect label="Filtrer" value={f.status} onChange={e => f.setStatus(e.target.value)} values={['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']}/></div><LoadState state={state}>{d => <><Table items={d.items} columns={orderColumns}/><Pager data={d} page={f.page} setPage={f.setPage}/></>}</LoadState></Panel></>;
}

export function OrderDetail() {
  const { id } = useParams();
  const state = useData(`orders/${id}`);
  return <><Link className="ad-link" to="/admin/orders">← Commandes</Link><LoadState state={state}>{d => <OrderContent key={`${d.id}:${d.updated_at}`} order={d} reload={state.reload}/>}</LoadState></>;
}

function OrderContent({ order: o, reload }) {
  const isContext = Boolean(o.stripe_profile_ref || o.commerce_quote_id);
  async function exportSummary() {
    try {
      const document = await adminApi.get(`orders/${o.id}/document`);
      const url = URL.createObjectURL(new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }));
      const link = window.document.createElement('a'); link.href = url; link.download = `${o.order_number}-recapitulatif.json`; link.click(); URL.revokeObjectURL(url);
    } catch (error) { toast.error(errorMessage(error)); }
  }
  const [status, setStatus] = useState(o.fulfillment_status);
  const [tracking, setTracking] = useState(o.tracking_number || '');
  const [carrier, setCarrier] = useState(o.carrier || '');
  const [trackingUrl, setTrackingUrl] = useState(o.tracking_url || '');
  const [busy, setBusy] = useState(false);
  const [returnItem, setReturnItem] = useState(o.items[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const supplier = o.supplier_order;
  const [supplierStatus, setSupplierStatus] = useState(supplier?.status || 'pending_validation');
  const [alibabaOrderId, setAlibabaOrderId] = useState(supplier?.alibaba_order_id || '');
  const [agentOrderId, setAgentOrderId] = useState(supplier?.agent_order_id || '');
  const [agentProvider, setAgentProvider] = useState(supplier?.agent_provider || 'HyperSKU');
  const [agentConnection, setAgentConnection] = useState(supplier?.agent_connection_status || 'not_connected');
  const [supplierNotes, setSupplierNotes] = useState(supplier?.notes || '');
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  async function save(e) {
    e.preventDefault();
    if (o.stripe_profile_ref || o.commerce_quote_id) {
      toast.error('Cette commande nécessite un traitement par dossier fournisseur avec sa preuve et sa version. Les étapes globales historiques ne peuvent pas être utilisées.');
      return;
    }
    if (status === 'cancelled' && !window.confirm('Annuler cette commande ? Un paiement reçu doit être remboursé séparément dans Stripe. Le stock ne sera pas remis automatiquement.')) return;
    setBusy(true);
    try { await adminApi.put(`orders/${o.id}`, { fulfillment_status: status, tracking_number: tracking, carrier: carrier || null, tracking_url: trackingUrl || null, expected_updated_at: o.updated_at }); toast.success('Commande mise à jour'); reload(); }
    catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  async function createReturn(e) {
    e.preventDefault(); setBusy(true);
    try { await adminApi.post('returns', { order_item_id: returnItem, quantity: Number(quantity), reason }); toast.success('Retour enregistré'); reload(); }
    catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  async function saveSupplier(e) {
    e.preventDefault();
    if (o.stripe_profile_ref || o.commerce_quote_id) {
      toast.error('Cette commande utilise des dossiers fournisseurs distincts. La confirmation doit conserver la référence exacte et une preuve par dossier.');
      return;
    }
    setBusy(true);
    try {
      await adminApi.put(`orders/${o.id}/supplier`, {
        status: supplierStatus, alibaba_order_id: alibabaOrderId || null, agent_order_id: agentOrderId || null,
        agent_provider: agentProvider.trim(), agent_connection_status: agentConnection,
        notes: supplierNotes || null, expected_updated_at: supplier.updated_at,
      });
      toast.success('Traitement fournisseur mis à jour'); reload();
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  async function refreshSupplierLinks() {
    setBusy(true);
    try {
      const result = await adminApi.post(`orders/${o.id}/supplier/refresh-links`, { expected_updated_at: supplier.updated_at });
      toast.success(result.refreshed ? `${result.refreshed} lien(s) récupéré(s)` : 'Aucun nouveau lien disponible : complétez les fiches produits');
      reload();
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); setConfirmRefresh(false); }
  }
  const agentDashboard = agentProvider.trim().toLowerCase() === 'hypersku' ? 'https://app.hypersku.com/dashboard'
    : agentProvider.trim().toLowerCase() === 'cjdropshipping' ? 'https://cjdropship.com/fulfillment-service/' : null;
  const canRefreshLinks = supplier && ['pending_validation', 'requires_attention'].includes(supplier.status)
    && !supplier.approved_at && !supplier.ordered_at && !supplier.alibaba_order_id && !supplier.agent_order_id
    && o.payment_status === 'paid' && !['cancelled', 'refunded'].includes(o.status)
    && !['shipped', 'delivered', 'cancelled'].includes(o.fulfillment_status)
    && (supplier.items || []).some(item => !item.exact_source_url?.trim());
  const address = a => a && Object.values(a).some(Boolean) ? [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(' '), a.state, a.country].filter(Boolean).map((v, i) => <div key={i}>{v}</div>) : 'Non renseignée';
  return <><PageTitle title={o.order_number} description={date(o.created_at)}><Badge value={o.payment_status}/><Badge value={o.fulfillment_status}/><button className="ad-btn" onClick={exportSummary}>Exporter le récapitulatif (non facture)</button></PageTitle>
    <div className="ad-grid-2"><Panel title="Articles"><Table items={o.items} columns={[{ label: 'Produit', render: r => <><strong>{r.product_name}</strong><small>{r.sku}</small></> }, { label: 'Qté', render: r => r.quantity }, { label: 'Prix unitaire', render: r => money(r.unit_amount_cents) }, { label: 'Total', render: r => money(r.quantity * r.unit_amount_cents) }]}/>
      <dl className="ad-totals">{[['Sous-total', o.subtotal_cents], ['Réduction', -(o.discount_amount_cents || 0)], ['Livraison', o.shipping_amount_cents], ['Taxes', o.tax_amount_cents], ['Total', o.total_cents], ['Remboursements confirmés', o.refunded_amount_cents || 0]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{money(v)}</dd></div>)}</dl></Panel>
      <Panel title="Client & livraison"><h3>{o.customer_name || 'Client invité'}</h3><p>{o.customer_email || 'E-mail non renseigné'}</p><p>{o.customer_phone || 'Téléphone non renseigné'}</p><div className="ad-grid-2"><div><h3>Livraison</h3><address>{address(o.shipping_address)}</address></div><div><h3>Facturation</h3><address>{address(o.billing_address)}</address></div></div><p className="ad-note">Canal : {o.sales_channel === 'website' ? 'Site TYMotors' : o.sales_channel} · Prestataire : {o.stripe_session_id ? 'Stripe Checkout' : 'Non renseigné'}</p>{o.requires_compatibility_review && <p className="ad-alert">Compatibilité du véhicule à vérifier avant expédition.</p>}</Panel></div>
    <div className="ad-grid-2"><Panel title="Traitement de la commande">{isContext ? <p className="ad-note">Enregistrez les preuves et le suivi dans chaque dossier fournisseur ci-dessous. Les statuts de la commande sont calculés à partir de ses colis.</p> : <form onSubmit={save}><StatusSelect value={status} onChange={e => setStatus(e.target.value)} values={['unfulfilled','processing','requires_review','shipped','delivered','cancelled']}/><Field label="Transporteur" value={carrier} onChange={e => setCarrier(e.target.value)} maxLength={100}/><Field label="Numéro de suivi" value={tracking} onChange={e => setTracking(e.target.value)} maxLength={200}/><Field label="Lien de suivi" type="url" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} placeholder="https://…" maxLength={1000}/><button className="ad-btn ad-primary" disabled={busy}>Enregistrer</button></form>}
      <p className="ad-note">L’annulation ne déclenche aucun remboursement ni remise en stock.</p>{o.stripe_dashboard_url && <a className="ad-btn" href={o.stripe_dashboard_url} target="_blank" rel="noreferrer">Paiement et remboursement dans Stripe <ArrowUpRight size={15}/></a>}<p className="ad-note">Les remboursements sont effectués dans Stripe et confirmés ici par son webhook. Aucun remboursement simulé.</p></Panel>
      <Panel title="Ouvrir un retour">{o.paid_at ? <form onSubmit={createReturn}><Field label="Article"><select value={returnItem} onChange={e => setReturnItem(e.target.value)} required>{o.items.map(i => <option key={i.id} value={i.id}>{i.product_name}</option>)}</select></Field><Field label="Quantité" type="number" min="1" max={o.items.find(i => i.id === returnItem)?.quantity || 1} value={quantity} onChange={e => setQuantity(e.target.value)} required/><Field label="Motif" value={reason} minLength={3} maxLength={1000} onChange={e => setReason(e.target.value)} required/><button className="ad-btn" disabled={busy}>Enregistrer la demande</button></form> : <p className="ad-note">Disponible après un paiement confirmé.</p>}<div className="ad-stack">{o.returns.map(r => <p key={r.id}>{r.reason} · <Badge value={r.status}/></p>)}</div></Panel></div>
    {isContext && <ContextFulfillment order={o} reloadOrder={reload}/> }
    {!isContext && supplier ? <Panel title="Commande fournisseur · validation manuelle"><p className="ad-note">Aucun achat n’est déclenché automatiquement. Vérifiez chaque référence, validez ici, puis effectuez et payez la commande dans Alibaba.</p>
      <Table items={supplier.items || []} columns={[{ label: 'Article', render: r => <><strong>{r.product_name}</strong><small>{r.sku} · Qté {r.quantity}</small></> }, { label: 'Fournisseur', render: r => r.supplier_name || 'Non renseigné' }, { label: 'Lien Alibaba exact', render: r => r.exact_source_url ? <a className="ad-btn" href={r.exact_source_url} target="_blank" rel="noreferrer">Ouvrir <ArrowUpRight size={14}/></a> : <span className="ad-alert">Lien exact manquant</span> }]}/>
      {canRefreshLinks && <div>{confirmRefresh ? <div role="group" aria-label="Confirmation de récupération des liens"><p className="ad-note">Seuls les liens exacts manquants seront récupérés. Les liens et coûts existants restent inchangés. Les modifications non enregistrées de cette page seront perdues. Aucun achat ni validation ne sera déclenché.</p><button className="ad-btn" disabled={busy} onClick={refreshSupplierLinks}>Confirmer la récupération des liens</button> <button className="ad-btn" disabled={busy} onClick={() => setConfirmRefresh(false)}>Annuler la récupération</button></div> : <p><button className="ad-btn" disabled={busy} onClick={() => setConfirmRefresh(true)}>Récupérer les liens manquants des fiches produits</button></p>}</div>}
      <form className="ad-form-grid" onSubmit={saveSupplier}><StatusSelect label="Étape fournisseur" value={supplierStatus} onChange={e => setSupplierStatus(e.target.value)} values={['pending_validation','approved','ordered','received_by_agent','quality_control','ready_to_ship','requires_attention','cancelled']}/><Field label="Prestataire logistique" value={agentProvider} onChange={e => setAgentProvider(e.target.value)} minLength={2} maxLength={100} required placeholder="HyperSKU, CJdropshipping…"/><StatusSelect label="Connexion agent" value={agentConnection} onChange={e => setAgentConnection(e.target.value)} values={['not_connected','onboarding','connected']}/><Field label="Numéro de commande Alibaba" value={alibabaOrderId} onChange={e => setAlibabaOrderId(e.target.value)} maxLength={200}/><Field label="Référence agent / entrepôt" value={agentOrderId} onChange={e => setAgentOrderId(e.target.value)} maxLength={200}/><Field label="Notes internes"><textarea value={supplierNotes} onChange={e => setSupplierNotes(e.target.value)} maxLength={2000}/></Field><div className="ad-actions"><button className="ad-btn ad-primary" disabled={busy}>Enregistrer l’étape</button>{agentDashboard && <a className="ad-btn" href={agentDashboard} target="_blank" rel="noreferrer">Ouvrir {agentProvider.trim()} <ArrowUpRight size={14}/></a>}</div></form>
      <p className="ad-note">Le prestataire et l’état de connexion sont renseignés manuellement : ouvrir son espace ne connecte pas automatiquement TYMotors à son API.</p>
    </Panel> : isContext ? null : o.is_test ? <Panel title="Commande de test"><p className="ad-note">Paiement sandbox uniquement. Aucun stock réel consommé, aucun dossier fournisseur ni expédition déclenchés.</p></Panel> : o.payment_status === 'paid' ? <Panel title="Commande fournisseur"><p className="ad-alert">Le dossier fournisseur n’a pas encore été créé. Rechargez après la migration Supabase.</p></Panel> : null}
    <Panel title="Suivi visible par le client"><Table items={o.tracking_events || []} columns={[{ label: 'Date', render: r => date(r.occurred_at) }, { label: 'Étape', render: r => r.title }, { label: 'Description', render: r => r.description || '—' }, { label: 'Visible', render: r => r.is_customer_visible ? 'Oui' : 'Interne' }]}/></Panel>
    <Panel title="Emails de la commande"><Table items={o.emails || []} columns={[{ label: 'Date', render: r => date(r.created_at) }, { label: 'Type', render: r => r.email_type }, { label: 'Destinataire', render: r => r.recipient }, { label: 'Statut', render: r => <Badge value={r.status}/> }, { label: 'Erreur', render: r => r.error_message || '—' }]}/></Panel>
    <Panel title="Historique"><Table items={o.history} columns={[{ label: 'Date', render: r => date(r.created_at) }, { label: 'Action', render: r => r.action }, { label: 'Auteur', render: r => r.admin_user_id || 'Stripe / système' }, { label: 'Détails', render: r => <pre className="ad-json">{JSON.stringify(r.metadata, null, 2)}</pre> }]}/></Panel>
  </>;
}

export function Customers() {
  const f = useFilters(), state = useData('customers', f.params);
  return <><PageTitle title="Clients" description="Clients inscrits et invités, regroupés par adresse e-mail."/><Panel><div className="ad-toolbar"><SearchBox value={f.q} onChange={f.setQ} placeholder="Nom ou e-mail…"/></div><LoadState state={state}>{d => <><Table items={d.items} columns={[
    { label: 'Client', render: r => <DetailLink to={`/admin/customers/detail?email=${encodeURIComponent(r.email)}`}>{r.full_name || r.email}</DetailLink> },
    { label: 'E-mail', render: r => r.email }, { label: 'Commandes', render: r => r.order_count },
    { label: 'Total net dépensé', render: r => money(r.spent_cents) }, { label: 'Dernière commande', render: r => date(r.last_order_at) },
  ]}/><Pager data={d} page={f.page} setPage={f.setPage}/></>}</LoadState></Panel></>;
}
export function CustomerDetail() {
  const [params] = useSearchParams(), [page, setPage] = useState(1);
  const state = useData('customers/detail', { email: params.get('email'), page });
  return <><Link className="ad-link" to="/admin/customers">← Clients</Link><LoadState state={state}>{d => <><PageTitle title={d.full_name || 'Client'} description={d.email}/><Panel><p>{d.phone || 'Téléphone non renseigné'}</p><p>Total net : {money(d.spent_cents)} · Remboursements : {money(d.refunded_cents)}</p></Panel><Panel title="Commandes et retours"><p className="ad-note">Ouvrez une commande pour consulter ses retours et remboursements.</p><Table items={d.orders.items} columns={orderColumns}/><Pager data={d.orders} page={page} setPage={setPage}/></Panel></>}</LoadState></>;
}
