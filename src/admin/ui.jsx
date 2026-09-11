import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, ArrowUpRight, PackageOpen } from 'lucide-react';
import { adminApi, errorMessage, labels } from './api';

export function useData(path, params = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    adminApi.get(path, JSON.parse(key), controller.signal)
      .then(data => { if (!controller.signal.aborted) setState({ data, loading: false, error: null }); })
      .catch(error => { if (!controller.signal.aborted) setState({ data: null, loading: false, error }); });
    return () => controller.abort();
  }, [path, key, revision]);
  return { ...state, reload };
}

export function PageTitle({ eyebrow = 'Gestion TYMotors', title, description, children }) {
  return <header className="ad-page-title"><div><p className="ad-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="ad-muted">{description}</p>}</div><div className="ad-actions">{children}</div></header>;
}
export function Badge({ value }) { return <span className={`ad-badge ad-status-${value}`}>{labels[value] || value || '—'}</span>; }
export function Field({ label, children, ...props }) { return <label className="ad-field"><span>{label}</span>{children || <input {...props} />}</label>; }
export function Select({ label, value, onChange, options, ...props }) {
  return <Field label={label}><select value={value ?? ''} onChange={onChange} {...props}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>;
}
export function StatusSelect({ value, onChange, values, label = 'Statut', ...props }) {
  return <Select {...props} label={label} value={value} onChange={onChange} options={values.map(v => ({ value: v, label: labels[v] || 'Tous les statuts' }))} />;
}
export function Loading() { return <div className="ad-skeletons" role="status" aria-label="Chargement"><span/><span/><span/><span/></div>; }
export function Empty({ message = 'Aucun résultat pour le moment.' }) { return <div className="ad-empty"><PackageOpen size={32}/><p>{message}</p></div>; }
export function LoadState({ state, children }) {
  if (state.loading) return <Loading/>;
  if (state.error) return <div className="ad-alert" role="alert"><p>{errorMessage(state.error)}</p><button className="ad-btn" onClick={state.reload}><RefreshCw size={16}/>Réessayer</button></div>;
  return children(state.data);
}
export function Table({ columns, items, emptyMessage }) {
  if (!items.length) return <Empty message={emptyMessage}/>;
  return <div className="ad-table-scroll" tabIndex={0} role="region" aria-label="Tableau défilant"><table className="ad-table"><thead><tr>{columns.map(c => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{items.map((r, i) => <tr key={r.id || r.email || i}>{columns.map(c => <td key={c.label}>{c.render(r)}</td>)}</tr>)}</tbody></table></div>;
}
export function Pager({ data, page, setPage }) {
  return <footer className="ad-pager"><span>{data.total} résultat{data.total > 1 ? 's' : ''} · Page {page} / {Math.max(1, data.pages)}</span><div><button className="ad-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button><button className="ad-btn" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Suivant</button></div></footer>;
}
export function SearchBox({ value, onChange, placeholder = 'Rechercher…' }) {
  return <label className="ad-search"><Search size={17}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/></label>;
}
export function useFilters() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, updateStatus] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = setTimeout(() => { setDebounced(q); setPage(1); }, 300); return () => clearTimeout(timer); }, [q]);
  const setStatus = v => { updateStatus(v); setPage(1); };
  return { q, setQ, status, setStatus, page, setPage, params: { q: debounced, status, page, limit: 25 } };
}
export function DetailLink({ to, children = 'Ouvrir' }) { return <Link className="ad-link" to={to}>{children}<ArrowUpRight size={14}/></Link>; }
export function Panel({ title, children, className = '' }) { return <section className={`ad-panel ${className}`}>{title && <h2>{title}</h2>}{children}</section>; }
