import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Boxes, Users, RotateCcw, TicketPercent, Radio, Settings, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { adminApi, errorMessage } from './api';
import { Loading, Field, useData } from './ui';
import { Dashboard, Orders, OrderDetail, Customers, CustomerDetail } from './Commerce';
import { Products, ProductEditor, Inventory } from './Products';
import { Returns, Promotions, Channels, SettingsPage } from './Operations';
import './admin.css';

const navigation = [
  ['', 'Dashboard', LayoutDashboard], ['orders', 'Commandes', ShoppingBag], ['products', 'Produits', Package],
  ['inventory', 'Stocks', Boxes], ['customers', 'Clients', Users], ['returns', 'Retours', RotateCcw],
  ['promotions', 'Promotions', TicketPercent], ['channels', 'Canaux de vente', Radio], ['settings', 'Paramètres', Settings],
];

function ShopIdentity() {
  const { data, reload } = useData('settings');
  useEffect(() => {
    const handler = () => reload();
    window.addEventListener('ty-admin-settings', handler);
    return () => window.removeEventListener('ty-admin-settings', handler);
  }, [reload]);
  return <span className="ad-muted">{data?.shop_name || 'TYMotors'} <span className="ad-slash">/</span> Administration
    {data?.contact_email && <a className="ad-link" style={{marginLeft:12}} href={`mailto:${data.contact_email}`}>Contact</a>}</span>;
}

function AccessGate({ children }) {
  const { session, loading, signIn, signOut, configured } = useAuth();
  const [access, setAccess] = useState({ token: null, error: null });
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const token = session?.access_token;
  useEffect(() => {
    let current = true;
    setAccess({ token: null, error: null });
    if (token) adminApi.get('verify').then(() => { if (current) setAccess({ token, error: null }); })
      .catch(error => { if (current) setAccess({ token: null, error }); });
    return () => { current = false; };
  }, [token, revision]);
  if (loading || (token && !access.error && access.token !== token)) return <div className="ad-login"><Loading/></div>;
  if (token && access.token === token) return children;
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try { await signIn(data.get('email'), data.get('password')); } catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <main className="ad-login"><div className="ad-login-card"><div className="ad-brand">TY<span>MOTORS</span></div><p className="ad-eyebrow">Administration</p><ShieldCheck size={32}/><h1>{token ? 'Accès non autorisé' : 'Connexion sécurisée'}</h1>
    {access.error && <p role="alert" className="ad-alert">{errorMessage(access.error)}</p>}
    {!configured && <p className="ad-alert">La connexion Supabase doit être configurée pour accéder à l’administration.</p>}
    {token ? <div className="ad-actions"><button className="ad-btn" onClick={() => setRevision(n => n + 1)}>Vérifier à nouveau</button><button className="ad-btn" onClick={signOut}>Changer de compte</button></div> :
      <form onSubmit={submit}><Field label="Adresse e-mail" name="email" type="email" autoComplete="username" required/><Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required/><button className="ad-btn ad-primary" disabled={busy || !configured}>{busy ? 'Connexion…' : 'Se connecter'}</button></form>}
    <Link to="/" className="ad-muted">Retour à la boutique</Link></div></main>;
}

export default function AdminApp() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.title = 'Administration | TYMotors'; setOpen(false); window.scrollTo(0, 0);
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex,nofollow';
  }, [location.pathname]);
  async function logout() { try { await signOut(); } catch (e) { toast.error(errorMessage(e)); } }
  const nav = <><Link className="ad-brand" to="/admin">TY<span>MOTORS</span><small>BACK OFFICE</small></Link><p className="ad-nav-label">ESPACE DE GESTION</p><nav aria-label="Administration">{navigation.map(([path, label, Icon]) => <NavLink key={path} to={`/admin${path ? '/' + path : ''}`} end={!path} onClick={() => setOpen(false)}><Icon size={18}/>{label}</NavLink>)}</nav><footer className="ad-sidebar-footer"><span className="ad-muted">{user?.email}</span><button onClick={logout}><LogOut size={17}/>Déconnexion</button></footer></>;
  return <div className="ty-admin" data-lenis-prevent><AccessGate><aside className="ad-sidebar">{nav}</aside><div className="ad-workspace"><header className="ad-topbar"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="ad-mobile-menu ad-btn" aria-label="Ouvrir le menu"><Menu size={20}/></SheetTrigger><SheetContent side="left" className="ty-admin ad-drawer"><SheetTitle className="sr-only">Navigation administrateur</SheetTitle><SheetDescription className="sr-only">Les rubriques de gestion TYMotors</SheetDescription>{nav}</SheetContent></Sheet><ShopIdentity/><span className="ad-secure"><ShieldCheck size={14}/>Accès administrateur</span></header><main className="ad-main"><Routes>
    <Route index element={<Dashboard/>}/><Route path="orders" element={<Orders/>}/><Route path="orders/:id" element={<OrderDetail/>}/>
    <Route path="products" element={<Products/>}/><Route path="products/new" element={<ProductEditor/>}/><Route path="products/:id" element={<ProductEditor/>}/>
    <Route path="inventory" element={<Inventory/>}/><Route path="customers" element={<Customers/>}/><Route path="customers/detail" element={<CustomerDetail/>}/>
    <Route path="returns" element={<Returns/>}/><Route path="promotions" element={<Promotions/>}/><Route path="channels" element={<Channels/>}/><Route path="settings" element={<SettingsPage/>}/>
    <Route path="*" element={<div className="ad-empty"><h1>Page introuvable</h1><Link to="/admin">Retour au dashboard</Link></div>}/>
  </Routes></main></div></AccessGate></div>;
}
