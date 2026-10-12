import React, { useState } from 'react';
import { CookieChoices } from '@/components/layout/CookieConsent';
export default function CookiePolicy() {
  const [saved, setSaved] = useState(false);
  return <main className="pt-32 pb-24 min-h-screen bg-[#070809]"><div className="ty-container max-w-4xl">
    <h1 className="ty-display text-white text-4xl md:text-6xl mb-8">Politique de cookies</h1>
    <div className="space-y-6 text-ty-textMid leading-relaxed">
      <p>Cette politique couvre cookies, localStorage et sessionStorage sur votre navigateur.</p>
      <h2 className="text-white text-xl">Fonctions strictement nécessaires</h2>
      <p>Identifiant de panier invité, session Supabase, langue, affichage déjà vu du chargement et préférences de confidentialité. Ils ne servent pas au ciblage publicitaire. Le panier invité persiste jusqu’à sa suppression ; la session suit l’expiration et la déconnexion Supabase ; le chargement n’est mémorisé que pour la session du navigateur.</p>
      <h2 className="text-white text-xl">Services facultatifs</h2>
      <p>Aucun pixel publicitaire, Google Analytics, PostHog ou outil de mesure d’audience n’est intégré. Accepter ne charge aucun nouveau prestataire. Toute future intégration exige une information spécifique et un nouvel accord.</p>
      <p>Les images et polices externes nécessaires au rendu peuvent communiquer votre adresse IP à leur hébergeur ; ce n’est pas une autorisation de suivi publicitaire. Les destinataires sont décrits dans la politique de confidentialité.</p>
      <h2 className="text-white text-xl">Modifier ou retirer votre accord</h2>
      <CookieChoices onSaved={() => setSaved(true)}/>{saved && <p role="status">Choix enregistrés. Modifiez-les ici ou dans « Gérer mes cookies ».</p>}
      <p>Acceptation et refus sont mémorisés environ six mois. Effacer le stockage peut vider votre panier et vous déconnecter.</p>
      <p>Référence : <a href="https://www.cnil.fr/fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs" className="underline" target="_blank" rel="noreferrer">recommandations CNIL</a>. Mise à jour : 12 octobre 2026.</p>
    </div>
  </div></main>;
}
