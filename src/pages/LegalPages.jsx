import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteConfig, Withdrawals } from '@/lib/api';

function useConfig() {
  const [config, setConfig] = useState({ legal: {}, legal_ready: false });
  useEffect(() => { let current = true; SiteConfig.get().then(data => { if (current) setConfig(data); }).catch(() => {}); return () => { current = false; }; }, []);
  return config;
}
const value = (legal, key, label) => legal[key] || `[${label} à renseigner]`;
function Identity({ config }) {
  const l = config.legal || {};
  return <dl className="space-y-2 break-words">{[['company_name','Raison sociale / identité EI'],['legal_form','Forme juridique'],['siret','SIRET'],['registration','Immatriculation'],['address','Adresse professionnelle'],['contact_email','Email de contact'],['contact_phone','Téléphone'],['vat_mention','Mention TVA']].map(([key,label]) => <div key={key}><dt className="inline font-semibold text-white">{label} : </dt><dd className="inline">{value(l,key,label)}</dd></div>)}</dl>;
}
function Layout({ title, config, children }) {
  return <main className="pt-32 pb-24 min-h-screen bg-[#070809]"><div className="ty-container max-w-4xl">
    <h1 className="ty-display text-white text-4xl md:text-6xl mb-8">{title}</h1>
    {!config.legal_ready && <p role="status" className="border border-[#F2C94C]/40 rounded-xl p-4 text-[#F2C94C] mb-8">Version de préparation : informations d’entreprise incomplètes. Paiements de test uniquement ; ces textes doivent être complétés et vérifiés avant la vente réelle.</p>}
    <div className="space-y-7 text-ty-textMid leading-relaxed">{children}</div>
    <p className="mt-10 text-xs text-ty-textLow">Version du 12 octobre 2026 · <button className="underline" onClick={() => window.print()}>Imprimer / conserver cette page</button></p>
  </div></main>;
}
function Section({ title, children }) { return <section className="space-y-3"><h2 className="text-white text-xl font-semibold">{title}</h2>{children}</section>; }
export function MentionsPage() {
  const config = useConfig(); const l = config.legal;
  return <Layout title="Mentions légales" config={config}>
    <Section title="Éditeur"><p>TYMotors est le nom commercial du site ; l’identité légale du vendeur est indiquée ci-dessous.</p><Identity config={config}/><p>Directeur de publication : {value(l,'publication_director','Directeur de publication')}.</p></Section>
    <Section title="Hébergement"><p>{value(l,'hosting_details','Identité, adresse et téléphone des hébergeurs Vercel / Render / Supabase')}</p></Section>
    <Section title="Contenus et équipements"><p>Les droits des photographies et marques appartiennent à leurs titulaires. Leur présence n’implique aucun partenariat constructeur. La compatibilité technique ne constitue pas une homologation routière ; vérifiez la réglementation et l’installation professionnelle applicable.</p></Section>
    <Section title="Médiation de la consommation"><p>Médiateur : {value(l,'mediator_name','Médiateur agréé choisi')} · {value(l,'mediator_address','Adresse du médiateur')} · {value(l,'mediator_url','Site du médiateur')}.</p><p>Après une réclamation écrite non résolue, vous pouvez saisir gratuitement le médiateur compétent. Aucun médiateur n’est inventé ou désigné sans convention.</p></Section>
    <p>Référence : <a className="underline" href="https://entreprendre.service-public.gouv.fr/vosdroits/F31228" target="_blank" rel="noreferrer">mentions obligatoires d’un entrepreneur individuel</a>.</p>
  </Layout>;
}
export function TermsPage() {
  const config = useConfig();
  return <Layout title="Conditions générales de vente" config={config}>
    <Section title="Vendeur et objet"><Identity config={config}/><p>Ces conditions encadrent la vente aux consommateurs de pièces et accessoires automobiles présentés sur TYMotors. Les brouillons et références non vérifiées ne sont pas vendables.</p></Section>
    <Section title="Commande, prix et livraison"><p>Vérifiez votre véhicule, la fiche, la quantité et le panier avant le paiement. Le serveur calcule les prix en euros depuis la base, les réductions et les frais de livraison séparés. La mention TVA est celle de l’éditeur, à compléter avant vente. Le délai applicable et les restrictions sont indiqués avant l’achat ; aucun délai fournisseur inconnu n’est garanti.</p><p>{config.stripe_mode !== 'live' && 'Actuellement Stripe fonctionne en test. '}Une vraie commande ne peut être ouverte qu’après validation juridique, disponibilité, compatibilité, coût et délai fournisseur. Les achats fournisseurs restent soumis à une validation humaine. Un retard ou une indisponibilité est communiqué au client ; aucun remplacement ne lui est imposé.</p></Section>
    <Section title="Garanties"><p>Vos garanties légales de conformité et des vices cachés restent applicables indépendamment d’une garantie commerciale. Pour un bien neuf, la garantie légale de conformité peut être exercée pendant deux ans à compter de sa délivrance. Contactez le vendeur, pas seulement le fabricant.</p><p><a className="underline" href="https://www.service-public.gouv.fr/particuliers/vosdroits/F11094" target="_blank" rel="noreferrer">Informations officielles sur la conformité et ses recours</a>.</p></Section>
    <Section title="Rétractation et litiges"><p>Consultez les modalités et le formulaire de <Link className="underline" to="/legal/withdrawal">rétractation</Link>. Une installation ne supprime pas automatiquement les droits légaux ; une dépréciation liée à des manipulations excessives s’apprécie selon la loi. Les frais de retour ordinaires sont à la charge du client, sauf défaut ou erreur du vendeur.</p><p>Réclamation via le <Link className="underline" to="/support/contact">contact</Link>, puis médiation indiquée dans les mentions légales. Le droit français s’applique sans priver le consommateur de protections impératives ni de sa compétence juridictionnelle légale.</p></Section>
  </Layout>;
}
export function PrivacyPage() {
  const config = useConfig();
  return <Layout title="Politique de confidentialité" config={config}>
    <Section title="Responsable et contact"><Identity config={config}/><p>Pour exercer vos droits, utilisez le <Link to="/support/contact" className="underline">formulaire de contact</Link>.</p></Section>
    <Section title="Données et finalités"><p>Compte, coordonnées, véhicule choisi, panier, commandes et suivi : exécution du contrat et mesures précontractuelles. Assistance et sécurité : intérêt légitime. Documents comptables : obligation légale. Newsletter : consentement distinct et révocable par le lien de désinscription. L’absence de coordonnées obligatoires empêche la livraison ; la newsletter reste facultative. TYMotors ne conserve ni numéro complet de carte ni cryptogramme, traités par Stripe.</p></Section>
    <Section title="Destinataires et transferts"><p>Personnel habilité, Supabase (base/Auth), Vercel, Render (hébergement), Stripe (paiement), Brevo ou SMTP configuré (emails). Images Unsplash et polices Google Fonts chargées par le navigateur reçoivent l’adresse IP. Agent logistique et transporteur reçoivent seulement les informations de livraison nécessaires, une fois réellement sélectionnés ; Alibaba n’est pas automatisé.</p><p>La base est hébergée à Paris, mais certains prestataires et agents peuvent traiter des données hors EEE. Les contrats, sous-traitants, clauses de transfert et destinataires logistiques exacts doivent être vérifiés et renseignés avant lancement. Les données ne sont pas revendues.</p></Section>
    <Section title="Conservation et droits"><p>Politique à mettre en œuvre et vérifier : données de compte pendant son usage ; facturation dix ans lorsqu’exigé par la loi ; prospection au maximum trois ans après le dernier contact pertinent, puis suppression ou anonymisation. Cette application ne prétend pas qu’une purge automatique est déjà planifiée. Les demandes de suppression restent traitées manuellement avec les obligations d’archivage.</p><p>Accès, rectification, effacement, limitation, opposition et portabilité selon les conditions légales ; retrait du consentement sans effet rétroactif. Réponse en principe sous un mois. Réclamation possible auprès de la CNIL. Aucun profilage décisionnel à effet juridique n’est intégré.</p><p><a className="underline" href="https://www.cnil.fr/fr/exemple-dinformation-clients-dun-site-de-vente-en-ligne-prospection-par-courriel-et-transmission-de" target="_blank" rel="noreferrer">Informations clients : référence CNIL</a> · <Link className="underline" to="/legal/cookies">cookies et retrait du consentement</Link>.</p></Section>
  </Layout>;
}
export function WithdrawalPage() {
  const config = useConfig(); const [form, setForm] = useState({ name:'', email:'', order_number:'', message:'' });
  const [receipt,setReceipt] = useState(null); const [error,setError] = useState(''); const [busy,setBusy] = useState(false); const [confirm,setConfirm] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { setReceipt(await Withdrawals.send({ ...form, confirmed:true })); } catch { setError('Demande non enregistrée. Vérifiez le numéro et l’email de commande, ou contactez-nous directement.'); } finally { setBusy(false); } }
  function download() { const url = URL.createObjectURL(new Blob([receipt.receipt_text],{type:'text/plain;charset=utf-8'})); const link=document.createElement('a'); link.href=url; link.download='accuse-retractation.txt'; link.click(); URL.revokeObjectURL(url); }
  return <Layout title="Droit de rétractation" config={config}>
    <Section title="Délais et modalités"><p>Pour les biens éligibles, notifiez votre décision dans les quatorze jours suivant leur réception, sans justification. Renvoyez ensuite le bien dans les quatorze jours suivant cette notification. L’adresse de retour : {value(config.legal,'returns_address','Adresse de retour')} ; ne renvoyez rien à une adresse fournisseur non confirmée.</p><p>Le remboursement inclut la livraison standard et intervient dans les quatorze jours de la notification ; pour les biens, il peut être différé jusqu’à récupération ou preuve d’expédition. Des exceptions légales concernent notamment les biens réellement fabriqués selon vos spécifications ou nettement personnalisés, à préciser sur leur fiche.</p><p><a className="underline" href="https://www.service-public.gouv.fr/particuliers/vosdroits/F10485" target="_blank" rel="noreferrer">Modalités officielles et formulaire type</a>.</p></Section>
    <Section title="Renoncer au contrat ici">{receipt ? <div role="status"><p>Demande enregistrée le {receipt.received_at}. Référence : {receipt.reference}.</p><p>{receipt.email_sent ? 'Accusé de réception envoyé par email.' : 'L’email n’a pas pu être envoyé : conservez l’accusé téléchargeable ci-dessous.'}</p><button className="ty-btn-line mt-4" onClick={download}>Télécharger l’accusé de réception</button><pre className="whitespace-pre-wrap break-words text-sm mt-4">{receipt.receipt_text}</pre></div> : <form onSubmit={submit} className="space-y-4">
      <p>Je vous notifie ma rétractation du contrat concernant cette commande. Cette demande ne déclenche pas de remboursement automatique.</p>
      {[['name','Nom'],['email','Email utilisé pour la commande'],['order_number','Numéro de commande']].map(([key,label]) => <label className="block" key={key}>{label}<input className="w-full mt-1 p-3 rounded-xl border border-[#232B3A] bg-[#0F1115]" required type={key==='email'?'email':'text'} maxLength={key==='name'?160:254} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/></label>)}
      <label className="block">Précisions facultatives<textarea className="w-full mt-1 p-3 rounded-xl border border-[#232B3A] bg-[#0F1115]" maxLength={2000} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/></label>
      <label className="flex gap-3"><input type="checkbox" required checked={confirm} onChange={e=>setConfirm(e.target.checked)}/>Je confirme ma décision de me rétracter.</label>
      {error && <p role="alert">{error}</p>}<button className="ty-btn-primary" disabled={busy || !confirm}>{busy?'Enregistrement…':'Confirmer la rétractation'}</button>
    </form>}</Section>
  </Layout>;
}
