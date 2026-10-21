import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { Products } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import LoadedImage from '@/components/shared/LoadedImage';
import { formatPrice } from '@/lib/format';
import { productPhoto } from '@/lib/productPhoto';
import { availableForProject, checkedFit, projectTotals, vehiclePayload } from './project';
import { catalogueCategory } from './vehicleViews';

const FILTERS = ['all', 'performance', 'interior', 'technology'];
const PAGE_SIZE = 12;

function EquipmentCard({ product, entry, busy, onSelect, onRemove }) {
  const { t, i18n } = useTranslation();
  const selected = Boolean(entry);
  return <article className={`customize-equipment ${selected ? 'is-selected' : ''}`} data-testid="customize-equipment">
    <Link to={`/product/${product.slug}`} aria-label={product.name}>
      <LoadedImage src={productPhoto(product.images?.[0])} alt={product.name} className="customize-equipment-image" loading="lazy" />
    </Link>
    <div className="customize-equipment-copy">
      <h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
      <p className="customize-price">{formatPrice(product.price, product.currency, i18n.language)}</p>
      <p className="customize-stock">{t(`customize.project.${availableForProject(product) ? 'available' : product.status === 'active' && !product.test_purchase ? 'unavailable' : 'preview'}`)}</p>
      <p className="customize-fit" data-fit={entry?.status || 'unknown'}>{t(`customize.project.fit_${entry?.status || 'unknown'}`)}</p>
      <button type="button" className="customize-select-part" disabled={busy || entry?.status === 'checking'} aria-pressed={selected} onClick={() => selected ? onRemove(product.id) : onSelect(product)}>
        {selected ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        {t(`customize.project.${selected ? 'selected' : 'select'}`)}
      </button>
    </div>
  </article>;
}

export function ProjectBuilder({ selection, brandName, activeCategory, onCategoryChange, onBusyChange }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useApp();
  const [category, setCategory] = useState(() => catalogueCategory(activeCategory));
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [catalogue, setCatalogue] = useState({ loading: true, error: false, products: [], total: 0 });
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const alive = useRef(true), submitting = useRef(false);
  const vehicle = useMemo(() => vehiclePayload(selection), [selection]);
  const totals = projectTotals(items);
  const ready = items.length > 0 && items.every(item => item.status === 'compatible' && availableForProject(item.product)) && Object.keys(totals).length === 1;

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (activeCategory) { setCategory(catalogueCategory(activeCategory)); setPage(1); }
  }, [activeCategory]);
  useEffect(() => {
    let cancelled = false;
    setCatalogue({ loading: true, error: false, products: [], total: 0 });
    const args = { brand: selection.brand, model: selection.model, chassis: selection.generation, strict_vehicle: true, limit: PAGE_SIZE, page };
    if (vehicle.year) args.year = vehicle.year;
    if (vehicle.body_type) args.body_type = vehicle.body_type;
    if (vehicle.trim) args.trim = vehicle.trim;
    if (vehicle.has_camera != null) args.has_camera = vehicle.has_camera;
    if (vehicle.has_parking_sensors != null) args.has_parking_sensors = vehicle.has_parking_sensors;
    if (category !== 'all') args.category = category;
    Products.list(args).then(data => {
      if (cancelled) return;
      // An older API may ignore unknown query parameters. Never fall back to its
      // broad, unverified demo catalogue or filter only one page on the client.
      if (!Array.isArray(data?.items) || data.fitment_scope !== 'verified_vehicle') throw new Error('Invalid vehicle catalogue response');
      setCatalogue({ loading: false, error: false, products: data.items, total: Number.isInteger(data.total) && data.total >= data.items.length ? data.total : data.items.length });
    }).catch(() => { if (!cancelled) setCatalogue({ loading: false, error: true, products: [], total: 0 }); });
    return () => { cancelled = true; };
  }, [category, page, retry, selection.brand, selection.model, selection.generation, vehicle.year, vehicle.body_type, vehicle.trim, vehicle.has_camera, vehicle.has_parking_sensors]);

  const remove = id => { if (!submitting.current) setItems(current => current.filter(item => item.product.id !== id)); };
  const select = async product => {
    if (submitting.current) return;
    const token = Symbol(product.id);
    setNotice(null);
    setItems(current => current.some(item => item.product.id === product.id) ? current : [...current, { product, status: 'checking', token }]);
    let status;
    try { status = checkedFit(await Products.checkCompatibility(product.slug, vehicle), vehicle); }
    catch { status = 'error'; }
    if (alive.current) setItems(current => current.map(item => item.token === token ? { ...item, status } : item));
  };

  const addProject = async () => {
    if (submitting.current || !ready) return;
    submitting.current = true; setBusy(true); onBusyChange(true); setNotice(null);
    let added = 0;
    try {
      for (const item of items) {
        if (!alive.current) break;
        // Recheck current stock, price and fit immediately before each real cart write.
        const fresh = await Products.get(item.product.slug);
        const status = checkedFit(await Products.checkCompatibility(fresh.slug, vehicle), vehicle);
        if (!alive.current) break;
        if (!availableForProject(fresh) || status !== 'compatible' || fresh.price !== item.product.price || fresh.currency !== item.product.currency) {
          setItems(current => current.map(row => row.product.id === item.product.id ? { ...row, product: fresh, status } : row));
          throw new Error('Project requires review');
        }
        await addToCart(fresh.id, 1, vehicle);
        added += 1;
        if (alive.current) setItems(current => current.filter(row => row.product.id !== fresh.id));
      }
      if (alive.current) setNotice({ kind: 'success', key: 'cart_success', count: added });
    } catch {
      if (alive.current) setNotice({ kind: 'error', key: added ? 'cart_partial' : 'cart_error', count: added });
    } finally {
      submitting.current = false;
      if (alive.current) { setBusy(false); onBusyChange(false); }
    }
  };

  const requestMessage = [
    `${brandName} · ${selection.model} · ${selection.generation}`,
    [selection.year, selection.body_type, selection.trim].filter(Boolean).join(' · '),
    ...['has_camera', 'has_parking_sensors'].map(field => `${t(`customize.project.${field}`)} : ${t(`customize.project.${selection[field] == null ? 'unsure' : selection[field] ? 'yes' : 'no'}`)}`),
    ...items.map(({ product, status }) => `${product.name} (${product.slug}) — ${formatPrice(product.price, product.currency, i18n.language)} — ${t(`customize.project.fit_${status}`)}`),
  ].filter(Boolean).join('\n').slice(0, 4800);

  return <section className={`customize-project ${items.length ? 'has-selection' : ''}`} aria-labelledby="customize-equipment-title" data-testid="customize-project">
    <div className="customize-project-heading"><p className="customize-kicker">02 / {t('customize.project.equipment')}</p><h2 id="customize-equipment-title">{t('customize.project.equipment_title')}</h2><p>{t('customize.project.equipment_hint')}</p></div>
    <div className="customize-project-layout">
      <div className="customize-catalogue">
        <div className="customize-filters" aria-label={t('customize.project.categories')}>
          {FILTERS.map(filter => <button type="button" key={filter} disabled={busy} aria-pressed={category === filter} onClick={() => { setCategory(filter); setPage(1); onCategoryChange?.(filter); }}>{t(`customize.project.category_${filter}`)}</button>)}
        </div>
        {catalogue.loading ? <p role="status" className="customize-state">{t('common.loading')}</p> : catalogue.error ? <div role="alert" className="customize-state"><p>{t('customize.project.catalogue_error')}</p><button type="button" onClick={() => setRetry(value => value + 1)}>{t('customize.project.retry')}</button></div> : catalogue.products.length === 0 ? <div className="customize-state"><p>{t('customize.project.empty')}</p><Link to="/support/contact">{t('customize.project.ask_help')}</Link></div> : <>
          <p role="status" className="customize-results">{t('customize.project.results', { count: catalogue.total })}</p>
          <div className="customize-equipment-grid">{catalogue.products.map(product => <EquipmentCard key={product.id} product={product} entry={items.find(item => item.product.id === product.id)} busy={busy} onSelect={select} onRemove={remove} />)}</div>
          {catalogue.total > PAGE_SIZE && <nav className="customize-pagination" aria-label={t('customize.project.pagination')}><button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)}>{t('customize.project.previous')}</button><span>{page} / {Math.ceil(catalogue.total / PAGE_SIZE)}</span><button type="button" disabled={page * PAGE_SIZE >= catalogue.total} onClick={() => setPage(value => value + 1)}>{t('customize.project.next')}</button></nav>}
        </>}
      </div>
      <aside className="customize-summary" aria-labelledby="customize-summary-title" data-testid="customize-summary">
        <p className="customize-kicker">03 / {t('customize.project.summary')}</p><h2 id="customize-summary-title">{t('customize.project.your_project')}</h2>
        <p className="customize-summary-vehicle">{brandName} · {selection.model} · {selection.generation}{selection.year ? ` · ${selection.year}` : ''}</p>
        {items.length === 0 ? <p className="customize-summary-empty">{t('customize.project.no_selection')}</p> : <ul aria-live="polite">{items.map(({ product, status }) => <li key={product.id}><div><Link to={`/product/${product.slug}`}>{product.name}</Link><span className="customize-fit" data-fit={status}>{t(`customize.project.fit_${status}`)}</span><span>{formatPrice(product.price, product.currency, i18n.language)}</span></div><button type="button" disabled={busy} onClick={() => remove(product.id)} aria-label={t('customize.project.remove', { name: product.name })}><Trash2 size={17} aria-hidden="true" /></button></li>)}</ul>}
        <div className="customize-total"><span>{t('customize.project.parts_total')}</span><div>{Object.entries(totals).length ? Object.entries(totals).map(([currency, cents]) => <strong key={currency}>{formatPrice(cents / 100, currency, i18n.language)}</strong>) : <strong>{formatPrice(0, 'EUR', i18n.language)}</strong>}</div></div>
        <p className="customize-summary-note">{t('customize.project.total_hint')}</p>
        {!ready && items.length > 0 && <p className="customize-summary-note">{t('customize.project.blocked_hint')}</p>}
        <button type="button" className="ty-btn-primary customize-cart-button" disabled={busy || !ready} onClick={addProject} data-testid="customize-add-project">{t(`customize.project.${busy ? 'cart_adding' : 'cart_add'}`)}<ArrowRight size={17} aria-hidden="true" /></button>
        <Link className="customize-help-link" to="/support/contact" state={{ customizeRequest: { subject: t('customize.project.request_subject'), message: requestMessage } }} onClick={event => { if (busy) event.preventDefault(); }}>{t('customize.project.request_check')}</Link>
        {notice && <div role={notice.kind === 'error' ? 'alert' : 'status'} className="customize-notice"><p>{t(`customize.project.${notice.key}`, { count: notice.count })}</p>{notice.count > 0 && <Link to="/cart">{t('customize.project.view_cart')}</Link>}</div>}
      </aside>
    </div>
    {items.length > 0 && <div className="customize-project-dock"><span>{t('customize.project.selected_count', { count: items.length })}</span><a href="#customize-summary-title">{t('customize.project.view_project')}<ArrowRight size={16} aria-hidden="true" /></a></div>}
  </section>;
}
