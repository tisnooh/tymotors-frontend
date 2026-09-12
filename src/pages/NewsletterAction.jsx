import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Newsletter } from '@/lib/api';

export default function NewsletterAction({ action }) {
  const [params] = useSearchParams();
  const [state, setState] = useState({ status: 'loading', message: 'Validation en cours…' });
  useEffect(() => {
    let active = true;
    const token = params.get('token');
    if (!token) { setState({ status: 'error', message: 'Ce lien est incomplet.' }); return undefined; }
    const request = action === 'confirm' ? Newsletter.confirm(token) : Newsletter.unsubscribe(token);
    request.then(() => {
      if (active) setState({ status: 'success', message: action === 'confirm' ? 'Votre inscription à la newsletter TYMotors est confirmée.' : 'Vous êtes désinscrit de la newsletter TYMotors.' });
    }).catch((error) => {
      const expired = error?.response?.status === 410;
      if (active) setState({ status: 'error', message: expired ? 'Ce lien a expiré. Inscrivez-vous à nouveau pour recevoir un nouveau lien.' : 'Ce lien est invalide ou a déjà été utilisé.' });
    });
    return () => { active = false; };
  }, [action, params]);
  return <main className="pt-32 pb-24 min-h-[70vh]"><div className="ty-container max-w-lg rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-7">
    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F2C94C]">{'// Newsletter //'}</p>
    <h1 className="ty-display text-white text-4xl mt-3">TYMotors</h1>
    <p className={`${state.status === 'error' ? 'text-red-200' : 'text-ty-textMid'} mt-5`}>{state.message}</p>
    {state.status !== 'loading' && <Link to="/" className="ty-btn-secondary w-full mt-7">RETOUR À L’ACCUEIL</Link>}
  </div></main>;
}
