import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthEmail } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function AuthConfirm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', message: 'Validation de votre lien sécurisé…' });

  useEffect(() => {
    let active = true;
    async function confirm() {
      const token_hash = params.get('token_hash');
      const type = params.get('type');
      const next = params.get('next');
      if (!supabase || !token_hash || !['email', 'signup', 'recovery', 'email_change'].includes(type)) {
        if (active) setState({ status: 'error', message: 'Ce lien est invalide ou incomplet.' });
        return;
      }
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        if (active) setState({ status: 'error', message: 'Ce lien est invalide, expiré ou a déjà été utilisé.' });
        return;
      }
      if (type === 'recovery') {
        navigate(next === '/reset-password' ? next : '/reset-password', { replace: true });
        return;
      }
      if (type === 'email' || type === 'signup') {
        try { await AuthEmail.welcome(); } catch { /* The confirmed account remains valid; failure is logged server-side. */ }
      }
      if (active) setState({ status: 'success', message: type === 'email_change' ? 'Votre nouvelle adresse email est confirmée.' : 'Votre adresse email est confirmée.' });
    }
    confirm();
    return () => { active = false; };
  }, [navigate, params]);

  return <main className="pt-32 pb-24 min-h-[70vh]"><div className="ty-container max-w-lg rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-7">
    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]">{'// Sécurité du compte //'}</p>
    <h1 className="ty-display text-white text-4xl mt-3">{state.status === 'success' ? 'Confirmation réussie' : state.status === 'error' ? 'Lien non valide' : 'Confirmation en cours'}</h1>
    <p className={`${state.status === 'error' ? 'text-red-200' : 'text-ty-textMid'} mt-5`}>{state.message}</p>
    {state.status === 'success' && <Link to="/account" className="ty-btn-primary w-full mt-7">ACCÉDER À MON COMPTE</Link>}
    {state.status === 'error' && <Link to="/auth?mode=login" className="ty-btn-secondary w-full mt-7">RETOUR À LA CONNEXION</Link>}
  </div></main>;
}
