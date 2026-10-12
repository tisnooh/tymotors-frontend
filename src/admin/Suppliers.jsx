import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi, errorMessage } from './api';
import { useData, PageTitle, Panel, Field, LoadState, Pager } from './ui';

export function supplierMessage(supplier, products, type = 'quote') {
  const references = products.filter(p => supplier.product_ids.includes(p.id)).map(p => `- ${p.name} / ${p.sku}`).join('\n') || '[Références à préciser]';
  const request = type === 'agent'
    ? 'Please confirm the shipping cost and lead time to our sourcing agent, packaging, quality-control process and tracking. Agent address: [to be provided after agreement]. Do not dispatch before our written approval.'
    : 'Please provide a written quote: exact vehicle compatibility, available stock, MOQ, unit price, shipping cost and lead time to France, warranty, returns, package contents and product photos with usage permission. No purchase is authorized by this request.';
  return `Hello ${supplier.name},\n\nWe are preparing the TYMotors automotive shop.\n${references}\nProduct/store link: ${supplier.url || '[Link to be provided]'}\n\n${request}\n\nThank you,\nTYMotors`;
}

export default function Suppliers() {
  const [page, setPage] = useState(1), state = useData('suppliers', { page, limit: 25 }), options = useData('supplier-product-options');
  const [editing, setEditing] = useState(null);
  return <><PageTitle title="Fournisseurs" description="Fiches privées et échanges manuels. Aucun achat automatique Alibaba." ><button className="ad-btn ad-primary" onClick={() => setEditing({ name: '', url: '', notes: '', product_ids: [] })}>Nouveau fournisseur</button></PageTitle>
    <LoadState state={options}>{products => <>{editing && <SupplierForm key={editing.id || 'new'} initial={editing} products={products} close={() => setEditing(null)} saved={() => { setEditing(null); state.reload(); }} />}
      <LoadState state={state}>{d => <>{!d.items.length && <Panel>Aucun fournisseur enregistré.</Panel>}{d.items.map(s => <Panel key={s.id} title={s.name}>
        {s.url && <a className="ad-link" href={s.url} target="_blank" rel="noopener noreferrer">Ouvrir le lien fournisseur</a>}
        <p className="ad-note whitespace-pre-wrap">{s.notes || 'Aucune note'}</p>
        <ul>{products.filter(p => s.product_ids.includes(p.id)).map(p => <li key={p.id}><Link className="ad-link" to={`/admin/products/${p.id}`}>{p.name} · {p.sku}</Link></li>)}</ul>
        <Message supplier={s} products={products}/><button className="ad-btn" onClick={() => setEditing(s)}>Modifier la fiche</button>
      </Panel>)}<Pager data={d} page={page} setPage={setPage}/></>}</LoadState></>}</LoadState></>;
}
function Message({ supplier, products }) {
  const [type, setType] = useState('quote');
  const message = supplierMessage(supplier, products, type);
  async function copy() { try { await navigator.clipboard.writeText(message); toast.success('Message copié : vérifiez-le avant envoi.'); } catch { toast.error('Copie indisponible. Sélectionnez le texte pour le copier.'); } }
  return <details><summary>Modèles de messages</summary><Field label="Type de demande"><select value={type} onChange={e => setType(e.target.value)}><option value="quote">Devis et compatibilité</option><option value="agent">Expédition vers l’agent</option></select></Field><textarea aria-label="Message à copier" readOnly rows={10} value={message} className="w-full bg-transparent border p-3"/><button className="ad-btn" onClick={copy}>Copier le message</button><p className="ad-note">Aucune donnée client transmise. L’envoi reste à votre charge.</p></details>;
}
function SupplierForm({ initial, products, close, saved }) {
  const [form, setForm] = useState(initial), [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); try {
    const payload = { name: form.name.trim(), url: form.url || null, notes: form.notes, product_ids: form.product_ids, expected_updated_at: initial.updated_at || null };
    if (initial.id) await adminApi.put(`suppliers/${initial.id}`, payload); else await adminApi.post('suppliers', payload);
    toast.success('Fournisseur enregistré'); saved();
  } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); } }
  return <Panel title={initial.id ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}><form onSubmit={submit}><Field label="Nom" required minLength={2} maxLength={160} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><Field label="Lien HTTPS" type="url" pattern="https://.*" maxLength={1000} value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })}/><Field label="Notes"><textarea maxLength={5000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/></Field><fieldset><legend>Produits liés</legend>{products.map(p => <label key={p.id} className="flex gap-2 py-1"><input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={e => setForm({ ...form, product_ids: e.target.checked ? [...form.product_ids, p.id] : form.product_ids.filter(id => id !== p.id) })}/>{p.name} · {p.sku}</label>)}</fieldset><div className="ad-actions"><button className="ad-btn ad-primary" disabled={busy}>Enregistrer</button><button type="button" className="ad-btn" onClick={close}>Annuler</button></div></form></Panel>;
}
