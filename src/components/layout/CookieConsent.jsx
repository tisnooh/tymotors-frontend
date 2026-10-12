import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CONSENT_CHANGED, CONSENT_OPEN, readConsent, saveConsent } from '@/lib/consent';
const EMPTY = { analytics: false, marketing: false };
export function CookieChoices({ onSaved }) {
  const [choice, setChoice] = useState(() => readConsent() || EMPTY);
  return <div className="space-y-4">
    <p className="text-sm text-ty-textMid">Les fonctions essentielles restent actives. Aucun service de mesure d’audience ou de publicité n’est actuellement intégré.</p>
    <label className="flex items-center gap-3"><input type="checkbox" checked disabled/> Strictement nécessaires</label>
    <label className="flex items-center gap-3"><input type="checkbox" checked={choice.analytics} onChange={e => setChoice(c => ({ ...c, analytics: e.target.checked }))}/> Mesure d’audience facultative</label>
    <label className="flex items-center gap-3"><input type="checkbox" checked={choice.marketing} onChange={e => setChoice(c => ({ ...c, marketing: e.target.checked }))}/> Publicité personnalisée facultative</label>
    <button className="ty-btn-line w-full" onClick={() => { saveConsent(choice); onSaved?.(); }}>Enregistrer mes choix</button>
  </div>;
}
export default function CookieConsent() {
  const [choice, setChoice] = useState(readConsent);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const refresh = () => setChoice(readConsent()); const show = () => setOpen(true);
    window.addEventListener(CONSENT_CHANGED, refresh); window.addEventListener(CONSENT_OPEN, show);
    window.addEventListener('storage', refresh); document.addEventListener('visibilitychange', refresh);
    return () => { window.removeEventListener(CONSENT_CHANGED, refresh); window.removeEventListener(CONSENT_OPEN, show); window.removeEventListener('storage', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return <>
    {!choice && !open && <section aria-label="Choix des cookies" className="fixed z-[150] bottom-4 left-4 right-4 mx-auto max-w-3xl rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-5 shadow-2xl" data-lenis-prevent>
      <h2 className="text-white font-semibold">Vos choix de confidentialité</h2>
      <p className="text-sm text-ty-textMid mt-2">Mesure d’audience et publicité restent facultatives, désactivées sans accord. Aucun prestataire facultatif n’est actuellement actif. Changez d’avis dans le footer. <Link className="underline" to="/legal/cookies">Politique de cookies</Link>.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <button className="ty-btn-line" onClick={() => saveConsent(EMPTY)}>Tout refuser</button>
        <button className="ty-btn-line" onClick={() => saveConsent({ analytics: true, marketing: true })}>Tout accepter</button>
        <button className="ty-btn-line" onClick={() => setOpen(true)}>Personnaliser</button>
      </div>
    </section>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="bg-[#0A0B0E] border-[#232B3A] text-white max-h-[90dvh] overflow-y-auto" data-lenis-prevent>
      <DialogTitle>Personnaliser les cookies</DialogTitle><DialogDescription>Choix valables sur cet appareil environ six mois. Refuser ne bloque pas les achats.</DialogDescription>
      <CookieChoices key={String(open)} onSaved={() => setOpen(false)}/>
    </DialogContent></Dialog>
  </>;
}
