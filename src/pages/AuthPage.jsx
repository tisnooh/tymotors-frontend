import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const inputClass = 'h-12 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white placeholder:text-ty-textLow focus:border-[#E10600] focus:outline-none';

export default function AuthPage() {
  const { user, configured, signIn, signUp, resetPassword } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode') || 'login';
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'register') {
        const result = await signUp({ email: form.email, password: form.password, fullName: form.fullName });
        if (result.session) navigate('/account');
        else setMessage('Compte créé. Confirme ton adresse depuis l’e-mail envoyé par TYMotors.');
      } else if (mode === 'forgot') {
        await resetPassword(form.email);
        setMessage('Si cette adresse existe, un lien de réinitialisation vient d’être envoyé.');
      } else {
        await signIn(form.email, form.password);
        navigate('/account');
      }
    } catch (authError) {
      setError(authError?.message || 'Connexion impossible. Réessaie dans un instant.');
    } finally { setBusy(false); }
  }

  const title = mode === 'register' ? 'Créer mon compte' : mode === 'forgot' ? 'Mot de passe oublié' : 'Connexion';
  return (
    <main className="pt-32 pb-24 min-h-[75vh]">
      <div className="ty-container max-w-lg">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]">// Espace client //</p>
        <h1 className="ty-display text-white text-4xl md:text-5xl mt-3">{title}</h1>
        <p className="text-ty-textMid mt-3">Retrouve tes commandes, favoris, adresses et véhicules enregistrés.</p>
        {!configured && <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100 flex gap-3"><AlertTriangle className="h-5 w-5 shrink-0" />Auth staging non configurée sur cette Preview.</div>}
        {message && <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100 flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" />{message}</div>}
        {error && <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">{error}</div>}
        <form onSubmit={submit} className="mt-8 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6 space-y-4">
          {mode === 'register' && <label className="block text-sm text-ty-textMid">Nom complet<input required autoComplete="name" className={`${inputClass} mt-2`} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>}
          <label className="block text-sm text-ty-textMid">E-mail<input required type="email" autoComplete="email" className={`${inputClass} mt-2`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          {mode !== 'forgot' && <label className="block text-sm text-ty-textMid">Mot de passe<input required minLength={8} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className={`${inputClass} mt-2`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>}
          <button disabled={busy || !configured} className="ty-btn-primary w-full h-12 disabled:opacity-50">{busy ? 'Vérification…' : title}</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ty-textMid">
          {mode !== 'login' && <button onClick={() => setParams({ mode: 'login' })} className="hover:text-white">Déjà client ? Se connecter</button>}
          {mode !== 'register' && <button onClick={() => setParams({ mode: 'register' })} className="hover:text-white">Créer un compte</button>}
          {mode !== 'forgot' && <button onClick={() => setParams({ mode: 'forgot' })} className="hover:text-white">Mot de passe oublié</button>}
        </div>
        <p className="text-xs text-ty-textLow mt-8">En créant un compte, tu acceptes les <Link to="/legal/terms" className="underline">conditions générales</Link> et la <Link to="/legal/privacy" className="underline">politique de confidentialité</Link>.</p>
      </div>
    </main>
  );
}
