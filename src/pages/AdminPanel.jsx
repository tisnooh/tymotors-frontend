import React, { useState, useEffect, useRef } from 'react';

const API = process.env.REACT_APP_BACKEND_URL || 'https://tymotors-backend.onrender.com';

const CATEGORIES = ['performance', 'interior', 'technology', 'steering-wheels', 'active-sound', 'practical-accessories'];
const BRANDS = ['bmw', 'mercedes-benz', 'audi', 'volkswagen', 'porsche', 'toyota'];

function emptyProduct() {
  return {
    slug: '', name: '', subtitle: '', description: '',
    price: '', compare_at_price: '', currency: 'EUR',
    images: [], category_slug: 'performance', subcategory: '',
    compatible_brands: [], compatibilities: [], badges: [], sku: '', stock: 0,
    rating: null, review_count: 0, featured: false, specs: {},
    package_contents: [], installation_difficulty: '', installation_minutes: null,
    tools_required: [], warranty_months: null, delivery_estimate: '',
    status: 'draft', is_verified: false,
    admin: { supplier_reference: '', supplier_name: '', supplier_url: '', cost_price: null, shipping_cost: null, landed_cost: null, margin_amount: null, margin_percent: null },
  };
}

function PasswordGate({ onAuth }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit() {
    if (!pwd || checking) return;
    setChecking(true);
    try {
      const response = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!response.ok) throw new Error('unauthorized');
      const data = await response.json();
      onAuth(data.access_token);
    } catch (e) {
      setError(true);
      setPwd('');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080A0D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ background: '#0D1017', border: '1px solid #1A2030', borderRadius: 8, padding: '48px 40px', width: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, color: '#F2F4F7', marginBottom: 4 }}>TY<span style={{ color: '#C9A84C' }}>MOTORS</span></div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#4A5568', marginBottom: 32 }}>ACCÈS ADMIN</div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ width: '100%', background: '#0F1218', border: `1px solid ${error ? '#7f1d1d' : '#1A2030'}`, borderRadius: 4, padding: '12px 16px', color: '#E8E8E8', fontSize: 15, outline: 'none', fontFamily: "'Rajdhani', sans-serif", boxSizing: 'border-box', marginBottom: 8 }}
        />
        {error && <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 1, marginBottom: 12 }}>Connexion refusée ou temporairement limitée</div>}
        <button
          onClick={submit}
          style={{ width: '100%', background: '#C9A84C', color: '#000', border: 'none', padding: '13px', fontWeight: 800, letterSpacing: 2, fontSize: 13, cursor: 'pointer', borderRadius: 4, fontFamily: "'Rajdhani', sans-serif", marginTop: 8 }}
        >
          ACCÉDER
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [adminToken, setAdminToken] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [section, setSection] = useState('products');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'create'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  useEffect(() => { if (adminToken) { fetchProducts(); fetchOrders(); } }, [adminToken]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!adminToken) return <PasswordGate onAuth={setAdminToken} />;

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products?limit=200`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (res.status === 401) {
        setAdminToken('');
        throw new Error('session_expired');
      }
      const data = await res.json();
      setProducts(data.items || []);
    } catch (e) {
      notify('Erreur chargement produits', 'error');
    }
    setLoading(false);
  }

  async function fetchOrders() {
    try {
      const res = await fetch(`${API}/api/admin/orders?limit=100`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('orders_failed');
      const data = await res.json();
      setOrders(data.items || []);
    } catch (e) {
      notify('Erreur chargement commandes', 'error');
    }
  }

  async function updateOrder(orderId, fulfillmentStatus) {
    const response = await fetch(`${API}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ fulfillment_status: fulfillmentStatus }),
    });
    if (!response.ok) {
      notify('Mise à jour de commande refusée', 'error');
      return;
    }
    notify('Commande mise à jour');
    await fetchOrders();
  }

  function notify(text, type = 'ok') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  }

  function openCreate() {
    setForm(emptyProduct());
    setSelected(null);
    setView('create');
  }

  function openEdit(p) {
    setSelected(p);
    setForm({
      ...emptyProduct(),
      ...p,
      price: p.price?.toString() || '',
      compare_at_price: p.compare_at_price?.toString() || '',
      images: p.images || [],
      compatible_brands: p.compatible_brands || [],
      compatibilities: p.compatibilities || [],
      badges: p.badges || [],
      specs: p.specs || {},
      package_contents: p.package_contents || [],
      tools_required: p.tools_required || [],
      admin: p.admin || emptyProduct().admin,
    });
    setView('edit');
  }

  async function uploadImage(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/api/admin/upload-image`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: fd });
      const data = await res.json();
      if (!res.ok) {
        notify(`Erreur upload: ${data.detail || res.status}`, 'error');
      } else {
        setForm(f => ({ ...f, images: [...f.images, data.url] }));
        notify('Image uploadée !');
      }
    } catch (e) {
      notify('Erreur upload image', 'error');
    }
    setUploading(false);
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        stock: Number.parseInt(form.stock, 10) || 0,
        rating: form.rating === '' || form.rating == null ? null : Number.parseFloat(form.rating),
        installation_difficulty: form.installation_difficulty || null,
        installation_minutes: form.installation_minutes ? Number.parseInt(form.installation_minutes, 10) : null,
        warranty_months: form.warranty_months ? Number.parseInt(form.warranty_months, 10) : null,
      };
      const url = view === 'create'
        ? `${API}/api/admin/products`
        : `${API}/api/admin/products/${selected.slug}`;
      const method = view === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        notify(err.detail || 'Erreur', 'error');
      } else {
        notify(view === 'create' ? 'Produit créé !' : 'Produit mis à jour !');
        await fetchProducts();
        setView('list');
      }
    } catch (e) {
      notify('Erreur réseau', 'error');
    }
    setSaving(false);
  }

  async function archiveProduct(slug) {
    try {
      const response = await fetch(`${API}/api/admin/products/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!response.ok) throw new Error('delete_failed');
      notify('Produit archivé');
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (e) {
      notify('Erreur archivage', 'error');
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase()) ||
    p.category_slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.root}>
      {/* Notification */}
      {msg && (
        <div style={{ ...styles.notif, background: msg.type === 'error' ? '#7f1d1d' : '#14532d' }}>
          {msg.type === 'error' ? '✕ ' : '✓ '}{msg.text}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.logo}>TY<span style={{ color: '#C9A84C' }}>MOTORS</span></div>
          <div style={styles.subtitle}>ADMIN — GESTION PRODUITS</div>
        </div>
        {view === 'list' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={section === 'products' ? styles.btnPrimary : styles.btnGhost} onClick={() => setSection('products')}>PRODUITS</button>
            <button style={section === 'orders' ? styles.btnPrimary : styles.btnGhost} onClick={() => setSection('orders')}>COMMANDES ({orders.length})</button>
            <button style={styles.btnGhost} onClick={() => setAdminToken('')}>DÉCONNEXION</button>
            {section === 'products' && <button style={styles.btnPrimary} onClick={openCreate}>+ NOUVEAU PRODUIT</button>}
          </div>
        ) : (
          <button style={styles.btnGhost} onClick={() => setView('list')}>← RETOUR</button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && section === 'products' && (
        <div style={styles.container}>
          <div style={styles.toolbar}>
            <input
              style={styles.search}
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span style={styles.count}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Chargement...</div>
          ) : (
            <div style={styles.grid}>
              {filtered.map(p => (
                <div key={p.id || p.slug} style={styles.card}>
                  <div style={styles.cardImg}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={styles.img} />
                      : <div style={styles.noImg}>NO IMG</div>
                    }
                    {p.featured && <span style={styles.badge}>FEATURED</span>}
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardCat}>{p.category_slug?.toUpperCase()} · {p.subcategory}</div>
                    <div style={styles.cardName}>{p.name}</div>
                    <div style={styles.cardPrice}>€{p.price?.toFixed(2)}</div>
                    <div style={styles.cardStock}>Stock: {p.stock}</div>
                    <div style={styles.cardStock}>Statut: {p.status || 'legacy'} · {p.is_verified ? 'vérifié' : 'non vérifié'}</div>
                  </div>
                  <div style={styles.cardActions}>
                    <button style={styles.btnEdit} onClick={() => openEdit(p)}>MODIFIER</button>
                    <button style={styles.btnDelete} onClick={() => setDeleteConfirm(p)}>ARCHIVER</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'list' && section === 'orders' && (
        <div style={styles.container}>
          <div style={styles.formTitle}>COMMANDES DE TEST</div>
          {orders.length === 0 ? <div style={styles.loading}>Aucune commande enregistrée.</div> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {orders.map(order => (
                <article key={order.id} style={{ ...styles.card, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={styles.cardCat}>{order.order_number} · {order.payment_status}</div>
                      <div style={styles.cardName}>{order.customer_email || 'E-mail en attente'}</div>
                      <div style={styles.cardStock}>{order.items?.length || 0} article(s) · {((order.total_cents || 0) / 100).toFixed(2)} {order.currency || 'EUR'}</div>
                      {order.requires_compatibility_review && <div style={{ ...styles.cardStock, color: '#F2C94C' }}>Compatibilité à contrôler manuellement</div>}
                    </div>
                    <select value={order.fulfillment_status} onChange={event => updateOrder(order.id, event.target.value)} style={{ ...styles.input, width: 210, height: 42 }}>
                      {['unfulfilled', 'processing', 'requires_review', 'shipped', 'delivered', 'cancelled'].map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM VIEW (create or edit) */}
      {(view === 'create' || view === 'edit') && (
        <div style={styles.container}>
          <div style={styles.formTitle}>
            {view === 'create' ? 'NOUVEAU PRODUIT' : `MODIFIER — ${selected?.name}`}
          </div>

          <div style={styles.formGrid}>
            {/* LEFT */}
            <div style={styles.formCol}>
              <Field label="Nom" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
              <Field label="Slug (URL)" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} disabled={view === 'edit'} />
              <Field label="Sous-titre" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} />
              <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} multiline />
              <Field label="SKU" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} />

              <div style={styles.row}>
                <Field label="Prix (€)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" half />
                <Field label="Prix barré (€)" value={form.compare_at_price} onChange={v => setForm(f => ({ ...f, compare_at_price: v }))} type="number" half />
              </div>

              <div style={styles.row}>
                <Field label="Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" half />
                <Field label="Note (/5)" value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} type="number" half />
              </div>

              <SelectField
                label="Catégorie"
                value={form.category_slug}
                onChange={v => setForm(f => ({ ...f, category_slug: v }))}
                options={CATEGORIES}
              />
              <Field label="Sous-catégorie" value={form.subcategory} onChange={v => setForm(f => ({ ...f, subcategory: v }))} />

              <SelectField
                label="Statut de publication"
                value={form.status}
                onChange={v => setForm(f => ({ ...f, status: v }))}
                options={['draft', 'active', 'archived']}
              />

              <label style={styles.checkRow}>
                <input type="checkbox" checked={form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} />
                <span style={{ marginLeft: 8, color: '#C9A84C', fontWeight: 700 }}>Données et compatibilités vérifiées</span>
              </label>

              <CheckboxGroup
                label="Marques compatibles"
                options={BRANDS}
                selected={form.compatible_brands}
                onChange={v => setForm(f => ({ ...f, compatible_brands: v }))}
              />

              <CompatibilityEditor
                compatibilities={form.compatibilities}
                onChange={v => setForm(f => ({ ...f, compatibilities: v }))}
              />

              <TagInput
                label="Badges (ex: New, Best Seller)"
                tags={form.badges}
                onChange={v => setForm(f => ({ ...f, badges: v }))}
              />

              <SpecsEditor
                specs={form.specs}
                onChange={v => setForm(f => ({ ...f, specs: v }))}
              />

              <TagInput label="Contenu du colis" tags={form.package_contents} onChange={v => setForm(f => ({ ...f, package_contents: v }))} />
              <TagInput label="Outils nécessaires" tags={form.tools_required} onChange={v => setForm(f => ({ ...f, tools_required: v }))} />

              <div style={styles.row}>
                <div style={{ width: 'calc(50% - 6px)' }}><SelectField label="Difficulté de montage" value={form.installation_difficulty} onChange={v => setForm(f => ({ ...f, installation_difficulty: v }))} options={['', 'easy', 'medium', 'advanced', 'professional']} /></div>
                <Field label="Durée de montage (min)" value={form.installation_minutes || ''} onChange={v => setForm(f => ({ ...f, installation_minutes: v }))} type="number" half />
              </div>

              <div style={styles.row}>
                <Field label="Garantie réelle (mois)" value={form.warranty_months || ''} onChange={v => setForm(f => ({ ...f, warranty_months: v }))} type="number" half />
                <Field label="Délai estimé" value={form.delivery_estimate} onChange={v => setForm(f => ({ ...f, delivery_estimate: v }))} half />
              </div>

              <label style={styles.checkRow}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span style={{ marginLeft: 8, color: '#C9A84C', fontWeight: 700 }}>Produit Featured</span>
              </label>
            </div>

            {/* RIGHT - Images */}
            <div style={styles.formCol}>
              <div style={styles.fieldLabel}>IMAGES</div>
              <div
                style={styles.dropzone}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
              >
                {uploading ? '⏳ Upload en cours...' : '+ Cliquer ou glisser une image'}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); e.target.value = ''; }} />

              <div style={styles.imageGrid}>
                {form.images.map((url, i) => (
                  <div key={i} style={styles.imageThumb}>
                    <img src={url} alt="" style={styles.thumbImg} />
                    {i === 0 && <span style={styles.mainBadge}>PRINCIPALE</span>}
                    <button style={styles.removeImg} onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ ...styles.fieldLabel, marginTop: 24 }}>DONNÉES FOURNISSEUR — PRIVÉES</div>
              <Field label="Fournisseur" value={form.admin?.supplier_name || ''} onChange={v => setForm(f => ({ ...f, admin: { ...f.admin, supplier_name: v } }))} />
              <Field label="Référence fournisseur" value={form.admin?.supplier_reference || ''} onChange={v => setForm(f => ({ ...f, admin: { ...f.admin, supplier_reference: v } }))} />
              <Field label="URL fournisseur" value={form.admin?.supplier_url || ''} onChange={v => setForm(f => ({ ...f, admin: { ...f.admin, supplier_url: v } }))} />
              <div style={styles.row}>
                <Field label="Coût produit" value={form.admin?.cost_price || ''} onChange={v => setForm(f => ({ ...f, admin: { ...f.admin, cost_price: v ? Number(v) : null } }))} type="number" half />
                <Field label="Coût livraison" value={form.admin?.shipping_cost || ''} onChange={v => setForm(f => ({ ...f, admin: { ...f.admin, shipping_cost: v ? Number(v) : null } }))} type="number" half />
              </div>
            </div>
          </div>

          <div style={styles.formActions}>
            <button style={styles.btnGhost} onClick={() => setView('list')}>ANNULER</button>
            <button style={styles.btnPrimary} onClick={saveProduct} disabled={saving}>
              {saving ? 'ENREGISTREMENT...' : view === 'create' ? 'CRÉER LE PRODUIT' : 'ENREGISTRER LES MODIFICATIONS'}
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>ARCHIVER CE PRODUIT ?</div>
            <div style={styles.modalName}>{deleteConfirm.name}</div>
            <div style={styles.modalSub}>Le produit ne sera plus visible dans la boutique et restera récupérable.</div>
            <div style={styles.modalActions}>
              <button style={styles.btnGhost} onClick={() => setDeleteConfirm(null)}>ANNULER</button>
              <button style={{ ...styles.btnPrimary, background: '#7f1d1d' }} onClick={() => archiveProduct(deleteConfirm.slug)}>ARCHIVER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompatibilityEditor({ compatibilities, onChange }) {
  const blank = {
    brand_slug: 'bmw', model: '', chassis: '', generation: '', year_from: '', year_to: '',
    body_types: [], facelift: 'unknown', required_trim: [], excluded_trims: [], camera_compatible: null,
    parking_sensor_compatible: null, notes: '', is_verified: false,
  };
  const [entry, setEntry] = useState(blank);

  function add() {
    if (!entry.brand_slug || !entry.model || !entry.chassis || !entry.year_from || !entry.year_to) return;
    onChange([
      ...compatibilities,
      {
        ...entry,
        generation: entry.generation || entry.chassis,
        year_from: Number(entry.year_from),
        year_to: Number(entry.year_to),
      },
    ]);
    setEntry(blank);
  }

  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>COMPATIBILITÉS PRÉCISES</label>
      <div style={{ ...styles.row, flexWrap: 'wrap' }}>
        <select style={{ ...styles.input, flex: 1, minWidth: 140 }} value={entry.brand_slug} onChange={e => setEntry(v => ({ ...v, brand_slug: e.target.value }))}>
          {BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <input style={{ ...styles.input, flex: 1, minWidth: 140 }} placeholder="Modèle" value={entry.model} onChange={e => setEntry(v => ({ ...v, model: e.target.value }))} />
        <input style={{ ...styles.input, flex: 1, minWidth: 110 }} placeholder="Châssis" value={entry.chassis} onChange={e => setEntry(v => ({ ...v, chassis: e.target.value }))} />
        <input style={{ ...styles.input, width: 90 }} type="number" placeholder="De" value={entry.year_from} onChange={e => setEntry(v => ({ ...v, year_from: e.target.value }))} />
        <input style={{ ...styles.input, width: 90 }} type="number" placeholder="À" value={entry.year_to} onChange={e => setEntry(v => ({ ...v, year_to: e.target.value }))} />
      </div>
      <input style={styles.input} placeholder="Notes ou exclusions de compatibilité" value={entry.notes} onChange={e => setEntry(v => ({ ...v, notes: e.target.value }))} />
      <label style={styles.checkRow}>
        <input type="checkbox" checked={entry.is_verified} onChange={e => setEntry(v => ({ ...v, is_verified: e.target.checked }))} />
        <span style={{ marginLeft: 8 }}>Compatibilité vérifiée</span>
      </label>
      <button type="button" style={styles.btnAdd} onClick={add}>+ AJOUTER LA COMPATIBILITÉ</button>
      {compatibilities.map((item, index) => (
        <div key={`${item.brand_slug}-${item.chassis}-${item.year_from}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: 10, border: '1px solid #1A2030', borderRadius: 4 }}>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>
            {item.brand_slug} · {item.model} · {item.chassis} · {item.year_from}–{item.year_to} · {item.is_verified ? 'vérifiée' : 'à confirmer'}
          </span>
          <button type="button" style={{ ...styles.btnDelete, flex: 'none', borderLeft: 0, padding: 0 }} onClick={() => onChange(compatibilities.filter((_, i) => i !== index))}>RETIRER</button>
        </div>
      ))}
    </div>
  );
}

function SpecsEditor({ specs, onChange }) {
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');

  function add() {
    const k = key.trim();
    const v = val.trim();
    if (!k || !v) return;
    onChange({ ...specs, [k]: v });
    setKey(''); setVal('');
  }

  function remove(k) {
    const updated = { ...specs };
    delete updated[k];
    onChange(updated);
  }

  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>SPÉCIFICATIONS</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input style={{ ...styles.input, flex: 1 }} placeholder="Clé (ex: Material)" value={key}
          onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...styles.input, flex: 1 }} placeholder="Valeur (ex: Carbon)" value={val}
          onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button style={styles.btnAdd} onClick={add}>+</button>
      </div>
      {Object.keys(specs).length > 0 && (
        <div style={{ marginTop: 8, border: '1px solid #1A2030', borderRadius: 4, overflow: 'hidden' }}>
          {Object.entries(specs).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #1A2030' }}>
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>{k}</span>
              <span style={{ fontSize: 12, color: '#F2F4F7', display: 'flex', alignItems: 'center', gap: 10 }}>
                {v}
                <span style={{ cursor: 'pointer', color: '#7f1d1d', fontSize: 11 }} onClick={() => remove(k)}>✕</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline, type = 'text', disabled, half }) {
  return (
    <div style={{ ...styles.field, width: half ? 'calc(50% - 6px)' : '100%' }}>
      <label style={styles.fieldLabel}>{label}</label>
      {multiline
        ? <textarea style={{ ...styles.input, height: 90, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={{ ...styles.input, opacity: disabled ? 0.5 : 1 }} type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} />
      }
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <select style={styles.input} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onChange }) {
  function toggle(val) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  }
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={styles.checkboxGrid}>
        {options.map(o => (
          <label key={o} style={styles.checkItem}>
            <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
            <span style={{ marginLeft: 6 }}>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TagInput({ label, tags, onChange }) {
  const [input, setInput] = useState('');
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput(''); }
  }
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={styles.tagRow}>
        <input style={{ ...styles.input, flex: 1 }} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} placeholder="Appuyer sur Entrée pour ajouter" />
        <button style={styles.btnAdd} onClick={add}>+</button>
      </div>
      <div style={styles.tags}>
        {tags.map((t, i) => (
          <span key={i} style={styles.tag}>{t} <span style={{ cursor: 'pointer' }} onClick={() => onChange(tags.filter((_, j) => j !== i))}>✕</span></span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#080A0D', color: '#E8E8E8', fontFamily: "'Rajdhani', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #1A2030', background: '#0A0C10' },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: 4, color: '#F2F4F7' },
  subtitle: { fontSize: 11, letterSpacing: 3, color: '#4A5568', marginTop: 2 },
  container: { padding: '32px 40px', maxWidth: 1400, margin: '0 auto' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  search: { flex: 1, background: '#0F1218', border: '1px solid #1A2030', borderRadius: 4, padding: '10px 16px', color: '#E8E8E8', fontSize: 14, outline: 'none', fontFamily: "'Rajdhani', sans-serif" },
  count: { color: '#4A5568', fontSize: 13, letterSpacing: 1 },
  loading: { color: '#4A5568', textAlign: 'center', padding: 60, letterSpacing: 2 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card: { background: '#0D1017', border: '1px solid #1A2030', borderRadius: 6, overflow: 'hidden', transition: 'border-color .2s', display: 'flex', flexDirection: 'column' },
  cardImg: { position: 'relative', height: 180, background: '#080A0D', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A3040', fontSize: 11, letterSpacing: 2 },
  badge: { position: 'absolute', top: 8, right: 8, background: '#C9A84C', color: '#000', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, padding: '3px 7px', borderRadius: 2 },
  cardBody: { padding: '14px 16px', flex: 1 },
  cardCat: { fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: 700, color: '#F2F4F7', marginBottom: 6, lineHeight: 1.3 },
  cardPrice: { fontSize: 18, fontWeight: 800, color: '#E8E8E8', marginBottom: 4 },
  cardStock: { fontSize: 11, color: '#4A5568', letterSpacing: 1 },
  cardActions: { display: 'flex', borderTop: '1px solid #1A2030' },
  btnEdit: { flex: 1, padding: '10px', background: 'transparent', color: '#C9A84C', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, fontFamily: "'Rajdhani', sans-serif" },
  btnDelete: { flex: 1, padding: '10px', background: 'transparent', color: '#7f1d1d', border: 'none', borderLeft: '1px solid #1A2030', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, fontFamily: "'Rajdhani', sans-serif" },
  btnPrimary: { background: '#C9A84C', color: '#000', border: 'none', padding: '12px 28px', fontWeight: 800, letterSpacing: 2, fontSize: 12, cursor: 'pointer', borderRadius: 4, fontFamily: "'Rajdhani', sans-serif" },
  btnGhost: { background: 'transparent', color: '#C9A84C', border: '1px solid #C9A84C', padding: '11px 28px', fontWeight: 700, letterSpacing: 2, fontSize: 12, cursor: 'pointer', borderRadius: 4, fontFamily: "'Rajdhani', sans-serif" },
  formTitle: { fontSize: 20, fontWeight: 800, letterSpacing: 3, color: '#C9A84C', marginBottom: 28, borderBottom: '1px solid #1A2030', paddingBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 10, letterSpacing: 2, color: '#4A5568', fontWeight: 700 },
  input: { background: '#0F1218', border: '1px solid #1A2030', borderRadius: 4, padding: '10px 12px', color: '#E8E8E8', fontSize: 14, outline: 'none', fontFamily: "'Rajdhani', sans-serif", width: '100%', boxSizing: 'border-box' },
  dropzone: { border: '2px dashed #1A2030', borderRadius: 6, padding: '32px', textAlign: 'center', color: '#4A5568', cursor: 'pointer', fontSize: 13, letterSpacing: 1, transition: 'border-color .2s' },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 },
  imageThumb: { position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1', background: '#0F1218' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainBadge: { position: 'absolute', bottom: 4, left: 4, background: '#C9A84C', color: '#000', fontSize: 8, fontWeight: 800, letterSpacing: 1, padding: '2px 5px' },
  removeImg: { position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  checkItem: { display: 'flex', alignItems: 'center', fontSize: 12, color: '#A0AEC0', cursor: 'pointer' },
  checkRow: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 13 },
  tagRow: { display: 'flex', gap: 8 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { background: '#1A2030', border: '1px solid #C9A84C22', color: '#C9A84C', fontSize: 11, padding: '4px 10px', borderRadius: 20, letterSpacing: 1 },
  btnAdd: { background: '#1A2030', color: '#C9A84C', border: '1px solid #1A2030', padding: '0 14px', borderRadius: 4, cursor: 'pointer', fontSize: 18, fontFamily: "'Rajdhani', sans-serif" },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid #1A2030' },
  notif: { position: 'fixed', top: 20, right: 20, padding: '12px 20px', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, zIndex: 9999, fontFamily: "'Rajdhani', sans-serif" },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#0D1017', border: '1px solid #1A2030', borderRadius: 8, padding: 36, maxWidth: 400, width: '90%', textAlign: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 800, letterSpacing: 3, color: '#F2F4F7', marginBottom: 12 },
  modalName: { fontSize: 18, color: '#C9A84C', fontWeight: 700, marginBottom: 8 },
  modalSub: { fontSize: 12, color: '#4A5568', marginBottom: 24, letterSpacing: 1 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'center' },
};
