import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPassword() {
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  if (done) return <Navigate to="/account" replace />;
  return <main className="pt-32 pb-24 min-h-[70vh]"><form className="ty-container max-w-md" onSubmit={async (e) => {
    e.preventDefault(); setError('');
    try { await updatePassword(password); setDone(true); } catch (err) { setError(err?.message || 'Réinitialisation impossible'); }
  }}>
    <h1 className="ty-display text-white text-4xl">Nouveau mot de passe</h1>
    {!user && <p className="text-amber-200 mt-4">Ouvre cette page depuis le lien reçu par e-mail.</p>}
    {error && <p className="text-red-300 mt-4">{error}</p>}
    <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-6 h-12 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 text-white" placeholder="8 caractères minimum" />
    <button className="ty-btn-primary w-full h-12 mt-4">Enregistrer</button>
  </form></main>;
}
