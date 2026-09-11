import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Copy, Pencil, Archive, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi, money, date, errorMessage } from './api';
import { useData, PageTitle, Badge, Field, Select, StatusSelect, LoadState, Table, Pager, SearchBox, useFilters, DetailLink, Panel } from './ui';

const blank = {
  name: '', slug: '', sku: '', subtitle: '', description: '', price: 0, compare_at_price: null,
  stock: 0, low_stock_threshold: null, category_slug: '', currency: 'EUR', status: 'draft',
  images: [], compatibilities: [], tags: [], featured: false, is_verified: false,
  package_contents: [], installation_difficulty: null, delivery_estimate: '',
  admin: { supplier_name: '', supplier_reference: '', supplier_url: '', cost_price: null, supplier_verified: false, notes: '' },
};
const cleanRule = r => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'id'));
const productFields = ['name','slug','sku','subtitle','description','price','compare_at_price','currency','stock','low_stock_threshold',
  'category_slug','subcategory','compatible_brands','compatibilities','badges','images','tags','featured','is_verified','status',
  'rating','review_count','specs','package_contents','installation_difficulty','installation_minutes','tools_required',
  'warranty_months','delivery_estimate','admin'];
export function productPayload(p) {
  const result = Object.fromEntries(productFields.filter(k => p[k] !== undefined).map(k => [k, p[k]]));
  result.compatibilities = (p.compatibilities || []).map(cleanRule);
  return result;
}

export function Products() {
  const f = useFilters(), state = useData('products', f.params);
  const [busy, setBusy] = useState(null);
  async function archive(p) {
    if (!window.confirm(`Archiver « ${p.name} » ? Il sera retiré de la boutique. Les commandes et l’historique seront conservés.`)) return;
    setBusy(p.id);
    try { await adminApi.remove(`products/${encodeURIComponent(p.slug)}`); toast.success('Produit archivé'); state.reload(); }
    catch (e) { toast.error(errorMessage(e)); } finally { setBusy(null); }
  }
  async function toggle(p) {
    if (p.status === 'active' && !window.confirm('Désactiver ce produit et le retirer de la boutique ?')) return;
    setBusy(p.id);
    try { await adminApi.put(`products/${encodeURIComponent(p.slug)}`, { status: p.status === 'active' ? 'draft' : 'active', expected_updated_at: p.updated_at }); toast.success('Statut mis à jour'); state.reload(); }
    catch (e) { toast.error(errorMessage(e)); } finally { setBusy(null); }
  }
  return <><PageTitle title="Produits" description="Votre catalogue, ses compatibilités et ses marges brutes."><Link className="ad-btn ad-primary" to="/admin/products/new"><Plus size={16}/>Créer un produit</Link></PageTitle><Panel><div className="ad-toolbar"><SearchBox value={f.q} onChange={f.setQ} placeholder="Nom ou SKU…"/><StatusSelect label="Filtrer" value={f.status} onChange={e => f.setStatus(e.target.value)} values={['','active','draft','archived']}/></div><LoadState state={state}>{d => <><Table items={d.items} columns={[
    { label: 'Produit', render: p => <div className="ad-product-cell">{p.images[0] && <img src={p.images[0]} alt="" loading="lazy"/>}<div><DetailLink to={`/admin/products/${p.id}`}>{p.name}</DetailLink><small>{p.sku}</small></div></div> },
    { label: 'Marque / catégorie', render: p => <>{[...new Set(p.compatibilities.map(c => c.brand_slug))].join(', ') || '—'}<small>{p.category_slug}</small></> },
    { label: 'Prix', render: p => money(p.price * 100) }, { label: 'Achat', render: p => money(p.admin.cost_price == null ? null : p.admin.cost_price * 100) },
    { label: 'Marge brute', render: p => p.admin.cost_price == null ? 'Non disponible' : <>{money((p.price-p.admin.cost_price)*100)}<small>{((p.price-p.admin.cost_price)/p.price*100).toFixed(1)} %</small></> },
    { label: 'Stock', render: p => p.stock }, { label: 'Statut', render: p => <Badge value={p.status}/> },
    { label: 'Canaux', render: () => <Link className="ad-link" to="/admin/channels">Publications</Link> },
    { label: 'Actions', render: p => <div className="ad-actions"><Link className="ad-icon-btn" aria-label={`Modifier ${p.name}`} to={`/admin/products/${p.id}`}><Pencil size={16}/></Link><Link className="ad-icon-btn" aria-label={`Dupliquer ${p.name}`} to={`/admin/products/new?duplicate=${p.id}`}><Copy size={16}/></Link><button className="ad-btn" disabled={busy === p.id} onClick={() => toggle(p)}>{p.status === 'active' ? 'Désactiver' : 'Activer'}</button><button className="ad-icon-btn" aria-label={`Archiver ${p.name}`} disabled={busy === p.id || p.status === 'archived'} onClick={() => archive(p)}><Archive size={16}/></button></div> },
  ]}/><Pager data={d} page={f.page} setPage={f.setPage}/></>}</LoadState></Panel></>;
}

export function ProductEditor() {
  const { id } = useParams(), [params] = useSearchParams();
  const source = id || params.get('duplicate');
  const options = useData('catalog-options'), product = useData(source ? `products/${source}` : 'catalog-options');
  return <><Link className="ad-link" to="/admin/products">← Produits</Link><LoadState state={options}>{o => <LoadState state={product}>{p => <ProductForm key={source || 'new'} initial={source ? p : blank} id={id} duplicate={!id && !!source} options={o}/>}</LoadState>}</LoadState></>;
}

function ProductForm({ initial, id, duplicate, options }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => duplicate ? { ...initial, name: initial.name + ' — copie', slug: initial.slug + '-copie', sku: initial.sku + '-COPIE', stock: 0, status: 'draft', featured: false } : initial);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const change = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const supplier = (key, value) => change('admin', { ...form.admin, [key]: value });
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      const payload = productPayload(form);
      const p = id ? await adminApi.put(`products/${encodeURIComponent(initial.slug)}`, { ...payload, expected_updated_at: initial.updated_at }) : await adminApi.post('products', payload);
      toast.success('Produit enregistré');
      if (id) { setForm(p); initial = p; }
      navigate('/admin/products');
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 8*1024*1024) { toast.error('Image limitée à 8 Mo'); return; }
    setUploading(true);
    try { const result = await adminApi.upload(file); setForm(p => ({ ...p, images: [...p.images, result.url] })); toast.success('Image ajoutée'); }
    catch (error) { toast.error(errorMessage(error)); } finally { setUploading(false); }
  }
  function ruleChange(index, key, value) { change('compatibilities', form.compatibilities.map((r, i) => i === index ? { ...r, [key]: value } : r)); }
  const text = (label, key, props = {}) => <Field label={label} value={form[key] ?? ''} onChange={e => change(key, e.target.value)} {...props}/>;
  const number = (label, key, props = {}) => <Field label={label} type="number" min="0" step="1" value={form[key] ?? ''} onChange={e => change(key, e.target.value === '' ? null : Number(e.target.value))} {...props}/>;
  return <><PageTitle title={id ? 'Modifier le produit' : duplicate ? 'Dupliquer le produit' : 'Nouveau produit'} description="Les informations fournisseur restent strictement privées."/><form onSubmit={submit}>
    <div className="ad-form-layout"><div>
      <Panel title="Informations produit"><div className="ad-form-grid">{text('Nom', 'name', { required: true, minLength: 2, maxLength: 160 })}{text('Slug', 'slug', { required: true, minLength: 3, pattern: '[a-z0-9]+(-[a-z0-9]+)*' })}{text('SKU', 'sku', { required: true, minLength: 2, maxLength: 80 })}{text('Description courte', 'subtitle', { maxLength: 240 })}</div><Field label="Description"><textarea value={form.description} onChange={e => change('description', e.target.value)} required minLength={20} maxLength={5000} rows={5}/></Field><div className="ad-form-grid"><Select label="Catégorie" required value={form.category_slug} onChange={e => change('category_slug', e.target.value)} options={[{ value: '', label: 'Choisir une catégorie' }, ...options.categories.map(c => ({ value: c.slug, label: c.name }))]}/><Field label="Tags (séparés par des virgules)" value={(form.tags || []).join(',')} onChange={e => change('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}/></div></Panel>
      <Panel title="Images"><div className="ad-gallery">{form.images.map((url, i) => <div key={i}><img src={url} alt={`Visuel produit ${i+1}`}/><button type="button" className="ad-btn" onClick={() => change('images', form.images.filter((_, n) => n !== i))}>Retirer</button></div>)}</div><Field label="URLs HTTPS (une par ligne)"><textarea rows={3} value={form.images.join('\n')} onChange={e => change('images', e.target.value.split('\n').filter(Boolean))}/></Field><label className="ad-btn"><Upload size={16}/>{uploading ? 'Envoi…' : 'Importer une image'}<input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading || form.images.length >= 20} onChange={upload}/></label><p className="ad-note">La première image est la couverture. JPEG, PNG, WebP ou AVIF · 8 Mo maximum.</p></Panel>
      <Panel title="Compatibilité véhicule">{form.compatibilities.map((r, i) => <div className="ad-rule" key={i}><div className="ad-form-grid"><Select label="Marque" value={r.brand_slug || ''} required onChange={e => ruleChange(i, 'brand_slug', e.target.value)} options={[{ value: '', label: 'Choisir' }, ...options.brands.map(b => ({ value: b.slug, label: b.name }))]}/>{['model','chassis','generation'].map((k, n) => <Field key={k} label={['Modèle automobile','Châssis','Génération'][n]} value={r[k] || ''} onChange={e => ruleChange(i,k,e.target.value)}/>)}{['year_from','year_to'].map((k,n) => <Field key={k} label={n ? 'Année fin' : 'Année début'} type="number" min="1950" max="2100" value={r[k] || ''} onChange={e => ruleChange(i,k,e.target.value ? Number(e.target.value) : null)}/>)}</div><Field label="Notes de compatibilité" value={r.notes || ''} onChange={e => ruleChange(i,'notes',e.target.value)}/><label className="ad-check"><input type="checkbox" checked={!!r.is_verified} onChange={e => ruleChange(i,'is_verified',e.target.checked)}/>Compatibilité vérifiée sur une source fiable</label><button type="button" className="ad-btn" onClick={() => change('compatibilities',form.compatibilities.filter((_,n) => i !== n))}>Retirer la compatibilité</button></div>)}<button type="button" className="ad-btn" onClick={() => change('compatibilities',[...form.compatibilities,{ brand_slug: '', model: '', chassis: '', generation: '', year_from: null, year_to: null, is_verified: false }])}><Plus size={16}/>Ajouter un véhicule</button></Panel>
      <Panel title="Installation et livraison"><Field label="Contenu du colis (un élément par ligne)"><textarea value={(form.package_contents || []).join('\n')} onChange={e => change('package_contents', e.target.value.split('\n').filter(Boolean))}/></Field><div className="ad-form-grid"><Select label="Difficulté d’installation" value={form.installation_difficulty} onChange={e => change('installation_difficulty',e.target.value || null)} options={[{value:'',label:'Non renseignée'}, {value:'easy',label:'Facile'}, {value:'medium',label:'Intermédiaire'}, {value:'advanced',label:'Avancée'}, {value:'professional',label:'Professionnelle'}]}/>{text('Délai de livraison','delivery_estimate')}{number('Installation (minutes)','installation_minutes',{max:1440})}{number('Garantie (mois)','warranty_months',{max:120})}</div></Panel>
    </div><div>
      <Panel title="Prix & stock"><div className="ad-form-grid">{number('Prix de vente (€)','price',{step:'0.01',min:'0.01',required:true})}{number('Prix barré (€)','compare_at_price',{step:'0.01'})}</div><Field label="Prix d’achat (€)" type="number" step="0.01" min="0" value={form.admin?.cost_price ?? ''} onChange={e => supplier('cost_price', e.target.value === '' ? null : Number(e.target.value))}/><p className="ad-margin">Marge brute : {form.admin?.cost_price != null && form.price > 0 ? `${money((form.price-form.admin.cost_price)*100)} · ${((form.price-form.admin.cost_price)/form.price*100).toFixed(1)} %` : 'Coût à renseigner'}</p>{number('Stock initial','stock',{disabled:!!id,required:!id})}{id && <Link className="ad-link" to="/admin/inventory">Ajuster le stock avec un motif →</Link>}{number('Seuil d’alerte spécifique','low_stock_threshold')}<p className="ad-note">Laissez le seuil vide pour utiliser le réglage de la boutique.</p></Panel>
      <Panel title="Publication"><StatusSelect value={form.status} onChange={e => change('status',e.target.value)} values={['draft','active','archived']}/><label className="ad-check"><input type="checkbox" checked={form.featured} onChange={e => change('featured',e.target.checked)}/>Produit mis en avant</label><label className="ad-check"><input type="checkbox" checked={form.is_verified} onChange={e => change('is_verified',e.target.checked)}/>Fiche produit vérifiée</label><p className="ad-note">L’activation nécessite des images, une compatibilité et un fournisseur vérifiés, un prix d’achat, un contenu de colis et des informations de livraison.</p></Panel>
      <Panel title="Fournisseur · privé">{[['Nom fournisseur','supplier_name'],['SKU fournisseur','supplier_reference'],['URL produit fournisseur','supplier_url']].map(([label,k]) => <Field key={k} label={label} type={k === 'supplier_url' ? 'url' : 'text'} value={form.admin?.[k] || ''} onChange={e => supplier(k,e.target.value)}/>)}<Field label="Notes / délai fournisseur"><textarea value={form.admin?.notes || ''} onChange={e => supplier('notes',e.target.value)}/></Field><label className="ad-check"><input type="checkbox" checked={!!form.admin?.supplier_verified} onChange={e => supplier('supplier_verified',e.target.checked)}/>Fournisseur vérifié</label></Panel>
    </div></div><footer className="ad-savebar"><Link className="ad-btn" to="/admin/products">Annuler</Link><button className="ad-btn ad-primary" disabled={busy || uploading}>{busy ? 'Enregistrement…' : 'Enregistrer le produit'}</button></footer>
  </form></>;
}

export function Inventory() {
  const f = useFilters(), state = useData('inventory', f.params);
  const [selected, setSelected] = useState(null);
  return <><PageTitle title="Stocks" description="Stock disponible réel. Aucune réservation n’est effectuée avant paiement."/><Panel><div className="ad-toolbar"><SearchBox value={f.q} onChange={f.setQ} placeholder="Produit ou SKU…"/><StatusSelect label="Disponibilité" value={f.status} onChange={e => f.setStatus(e.target.value)} values={['','available','low','out']}/></div><LoadState state={state}>{d => <><Table items={d.items} columns={[
    {label:'Produit',render:r=><><strong>{r.name}</strong><small>{r.sku}</small></>},{label:'Disponible',render:r=>r.stock},{label:'Réservé',render:r=>r.reserved_stock},
    {label:'Seuil',render:r=>r.low_stock_threshold},{label:'État',render:r=><Badge value={r.stock_status}/>},{label:'Action',render:r=><button className="ad-btn" onClick={()=>setSelected(r)}>Ajuster / historique</button>},
  ]}/><Pager data={d} page={f.page} setPage={f.setPage}/></>}</LoadState></Panel>{selected && <StockForm key={selected.id} product={selected} done={()=>{setSelected(null);state.reload();}}/>}</>;
}
function StockForm({ product, done }) {
  const [delta,setDelta]=useState(0),[reason,setReason]=useState(''),[busy,setBusy]=useState(false);
  const state=useData(`inventory/${product.id}/movements`);
  async function submit(e) { e.preventDefault(); setBusy(true); try { await adminApi.post(`inventory/${product.id}`,{expected_stock:product.stock,delta:Number(delta),reason});toast.success('Stock ajusté');done(); } catch(e){toast.error(errorMessage(e));}finally{setBusy(false);} }
  return <Panel title={`Ajuster : ${product.name}`}><form onSubmit={submit} className="ad-form-grid"><Field label="Quantité à ajouter / retirer" type="number" min={-product.stock} max="100000" value={delta} onChange={e=>setDelta(e.target.value)} required/><Field label="Motif (réception, correction…)" minLength={3} maxLength={200} value={reason} onChange={e=>setReason(e.target.value)} required/><div className="ad-actions"><button className="ad-btn ad-primary" disabled={busy || Number(delta)===0}>Enregistrer</button><button type="button" className="ad-btn" onClick={done}>Fermer</button></div></form><p className="ad-note">Stock prévu : {product.stock+Number(delta)}. Une modification concurrente impose de recharger la liste.</p><LoadState state={state}>{d=><Table items={d.items} columns={[{label:'Date',render:r=>date(r.created_at)},{label:'Mouvement',render:r=>r.quantity>0?'+'+r.quantity:r.quantity},{label:'Après',render:r=>r.stock_after},{label:'Motif',render:r=>r.reason},{label:'Auteur',render:r=>r.admin_user_id||'Système'}]}/>}</LoadState></Panel>;
}
