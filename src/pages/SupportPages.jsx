import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, Package, HelpCircle, Truck } from 'lucide-react';
import { Contact, Tracking } from '@/lib/api';
import usePublicSiteConfig from '@/hooks/usePublicSiteConfig';

const contactDetails = legal => [
  { icon: Mail, label: 'Email', value: legal.contact_email },
  { icon: Phone, label: 'Téléphone', value: legal.contact_phone },
  { icon: MapPin, label: 'Adresse', value: legal.address },
].filter(detail => !!detail.value);

// ─── SHARED LAYOUT ───────────────────────────────────────────────────────────

function PageLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="pt-32 pb-24 min-h-screen bg-[#070809]">
      <div className="ty-container max-w-4xl">
        <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-[#F2C94C] flex items-center gap-2 mb-4">
          <span className="h-px w-8 bg-[#F2C94C]" /> {eyebrow}
        </p>
        <h1 className="ty-display text-white text-4xl md:text-6xl mb-4">{title}</h1>
        {subtitle && <p className="text-ty-textMid text-lg mb-12 max-w-2xl">{subtitle}</p>}
        <div className="border-t border-[#151A23] pt-12">{children}</div>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
        <span className="h-px w-6 bg-[#E10600]" /> {title}
      </h2>
      <div className="text-ty-textMid leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────

export function ContactPage() {
  const location = useLocation();
  const config = usePublicSiteConfig();
  const CONTACT_DETAILS = contactDetails(config.legal);
  const [form, setForm] = useState(() => {
    const request = location.state?.customizeRequest;
    return { name: '', email: '', subject: typeof request?.subject === 'string' ? request.subject.slice(0, 160) : '', message: typeof request?.message === 'string' ? request.message.slice(0, 5000) : '', website: '' };
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      await Contact.send(form);
      setSent(true);
    } catch (requestError) {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout eyebrow="SUPPORT" title="Contact" subtitle="Une question ? Envoyez-nous votre demande.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="space-y-6">
            {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
                <div className="h-10 w-10 rounded-full bg-[#E10600]/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#E10600]" />
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]">{label}</p>
                  <p className="text-white text-sm mt-0.5">{value}</p>
                </div>
              </div>
            ))}
            {CONTACT_DETAILS.length === 0 && <div className="p-5 rounded-xl border border-[#151A23] bg-[#0A0B0E]"><Mail className="h-6 w-6 text-[#E10600]" /><p className="text-white mt-3">Formulaire de contact sécurisé</p><p className="text-ty-textMid text-sm mt-1">Les coordonnées de contact seront publiées avant l’ouverture de la boutique. Vous pouvez utiliser ce formulaire pour enregistrer votre demande.</p></div>}
          </div>
        </div>

        <div>
          {sent ? (
            <div className="p-8 rounded-2xl border border-[#1a2a1a] bg-[#0a120a] text-center">
              <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Demande enregistrée</h3>
              <p className="text-ty-textMid text-sm">Votre demande est enregistrée. Nous vous répondrons dès que possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {[
                { key: 'name', label: 'Nom', type: 'text', placeholder: 'Votre nom' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'votre@email.com' },
                { key: 'subject', label: 'Sujet', type: 'text', placeholder: 'Sujet de votre message' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]/80 block mb-1.5">{label}</label>
                  <input
                    type={type}
                    required
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-11 px-4 rounded-xl bg-[#0F1115] border border-[#232B3A] text-sm text-white placeholder:text-ty-textLow focus:border-[#E10600] focus:outline-none transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]/80 block mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Votre message..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0F1115] border border-[#232B3A] text-sm text-white placeholder:text-ty-textLow focus:border-[#E10600] focus:outline-none transition-colors resize-none"
                />
              </div>
              {error && <p role="alert" className="text-red-300 text-sm">Le message n’a pas pu être envoyé. Veuillez réessayer.</p>}
              <button type="submit" disabled={sending} className="ty-btn-primary w-full h-12 uppercase tracking-[0.18em] text-xs disabled:opacity-50">
                {sending ? 'Envoi…' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── LIVRAISON ────────────────────────────────────────────────────────────────

export function ShippingPage() {
  return (
    <PageLayout eyebrow="SUPPORT" title="Livraison" subtitle="Consultez les conditions vérifiées pour votre panier et votre destination avant tout achat.">
      <Section title="Zones de livraison">
        <p>Le lancement est préparé pour la France. Les destinations proposées, les frais et le délai applicables sont précisés avant le paiement.</p>
      </Section>
      <Section title="Délais">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { zone: 'Livraison à vérifier', délai: 'Date ou délai confirmé avant achat', prix: 'Tarif du devis de livraison' },
            { zone: 'Panier et destination', délai: 'Conditions propres à la commande', prix: 'Aucun seuil de gratuité garanti' },
          ].map(({ zone, délai, prix }) => (
            <div key={zone} className="p-5 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 text-[#E10600]" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]">{zone}</span>
              </div>
              <p className="text-white font-bold">{délai}</p>
              <p className="text-ty-textMid text-sm mt-1">{prix}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Informations importantes">
        <p>• Les frais applicables à votre commande sont indiqués avant le paiement.</p>
        <p>• Consultez la page de suivi de commande pour les informations d’expédition disponibles.</p>
        <p>• La disponibilité, le temps de préparation et le délai de livraison doivent être confirmés avant la commande.</p>
        <p>• La provenance, le transport et les éventuels droits ou frais d’importation doivent être établis avant l’ouverture aux ventes et communiqués avant l’achat. Aucun supplément non accepté ne peut être ajouté après commande.</p>
      </Section>
      <Section title="Transporteurs">
        <p>Le transporteur, les éventuels colis séparés et les numéros de suivi sont indiqués lorsque leur attribution et leur prise en charge sont confirmées. TYMotors reste l’interlocuteur du client en cas de retard, perte ou non-conformité ; le client n’a pas à se substituer au vendeur pour gérer son fournisseur.</p>
      </Section>
    </PageLayout>
  );
}

// ─── RETOURS ─────────────────────────────────────────────────────────────────

export { WithdrawalPage as ReturnsPage } from './LegalPages';

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "Comment savoir si un produit est compatible avec mon véhicule ?", a: "Renseignez le véhicule dans Personnaliser, puis vérifiez la variante exacte et les restrictions de la fiche. Une compatibilité non confirmée ou une information manquante n’est pas une autorisation de montage. Demandez une vérification au support avant d’acheter si un doute subsiste." },
  { q: "Quels sont les délais de livraison ?", a: "Le délai dépend du produit, de sa disponibilité et de la destination. Il doit être confirmé avant la commande. Nous n'annonçons pas de livraison express ni d'expédition le jour même sans confirmation du prestataire." },
  { q: "La livraison est-elle gratuite ?", a: "Les frais de livraison dépendent du panier, de l’adresse et du mode de transport proposé. Leur montant est indiqué avant le paiement." },
  { q: "Puis-je retourner un article ?", a: "Pour les biens éligibles, vous disposez d’un droit de rétractation de 14 jours après réception. Consultez la page Retours et son formulaire ; les garanties légales restent applicables." },
  { q: "Les produits sont-ils garantis ?", a: "Les garanties légales de conformité et des vices cachés s’exercent auprès du vendeur, indépendamment d’une garantie fournisseur. Pour un bien neuf, les défauts de conformité apparaissant dans les deux ans de la délivrance relèvent des règles légales ; réparation ou remplacement sans frais doivent intervenir dans les conditions prévues par la loi. Une garantie commerciale supplémentaire n’existe que si ses conditions sont confirmées." },
  { q: "Comment suivre ma commande ?", a: "La page Suivi de commande affiche les dernières informations enregistrées avec le numéro de commande et l’email d’achat. Un numéro ou un lien transporteur n’apparaît qu’une fois confirmé. Une commande ou une expédition de test ne constitue pas un colis réellement envoyé." },
  { q: "Les produits nécessitent-ils une installation professionnelle ?", a: "Les fixations, modifications et conditions de montage doivent être confirmées pour la référence et le véhicule exacts. En l’absence d’instructions vérifiées, aucune facilité de pose ni homologation routière n’est présumée. Le recours à un professionnel ne dispense pas de respecter les garanties légales." },
  { q: "Acceptez-vous les paiements en plusieurs fois ?", a: "Les moyens de paiement disponibles sont affichés par Stripe au moment du règlement. Un paiement fractionné n'est disponible que s'il est proposé pour votre achat, selon les conditions et frais indiqués sur cette page." },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#151A23]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-white font-medium">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#E10600] shrink-0" /> : <ChevronDown className="h-4 w-4 text-ty-textMid shrink-0" />}
      </button>
      {open && <p className="text-ty-textMid text-sm leading-relaxed pb-5">{answer}</p>}
    </div>
  );
}

export function FAQPage() {
  return (
    <PageLayout eyebrow="SUPPORT" title="FAQ" subtitle="Les réponses aux questions les plus fréquentes.">
      <div className="space-y-0">
        {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} question={q} answer={a} />)}
      </div>
      <div className="mt-12 p-6 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] text-center">
        <HelpCircle className="h-8 w-8 text-[#F2C94C] mx-auto mb-3" />
        <p className="text-white font-bold mb-2">Vous n’avez pas trouvé votre réponse ?</p>
        <p className="text-ty-textMid text-sm mb-4">Envoyez votre demande depuis notre formulaire de contact.</p>
        <Link to="/support/contact" className="ty-btn-primary text-xs uppercase tracking-[0.18em] px-6 h-10 inline-flex items-center">
          Contacter le support
        </Link>
      </div>
    </PageLayout>
  );
}

// ─── SUIVI DE COMMANDE ────────────────────────────────────────────────────────

const FULFILLMENT_LABELS = {
  unfulfilled: 'Commande reçue',
  requires_review: 'Vérification en cours',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export function TrackPage() {
  const [orderNum, setOrderNum] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try { setResult(await Tracking.lookup(orderNum, email)); }
    catch (requestError) {
      setError(requestError.response?.status === 404
        ? 'Commande introuvable. Vérifiez le numéro et l’adresse e-mail utilisés lors de l’achat.'
        : 'Le suivi est temporairement indisponible. Veuillez réessayer dans quelques instants.');
    }
    finally { setLoading(false); }
  }

  return (
    <PageLayout eyebrow="SUPPORT" title="Suivi de commande" subtitle="Consultez les dernières informations enregistrées pour votre commande.">
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]/80 block mb-1.5">Numéro de commande</label>
            <input
              type="text"
              required
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              placeholder="ex: TY-2026-XXXXX"
              className="w-full h-11 px-4 rounded-xl bg-[#0F1115] border border-[#232B3A] text-sm text-white placeholder:text-ty-textLow focus:border-[#E10600] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C]/80 block mb-1.5">Adresse e-mail de la commande</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full h-11 px-4 rounded-xl bg-[#0F1115] border border-[#232B3A] text-sm text-white placeholder:text-ty-textLow focus:border-[#E10600] focus:outline-none transition-colors" />
          </div>
          <button type="submit" disabled={loading} className="ty-btn-primary w-full h-12 uppercase tracking-[0.18em] text-xs disabled:opacity-50">
            {loading ? 'Recherche…' : 'Rechercher'}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-6 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] text-center">
            <Package className="h-8 w-8 text-ty-textMid mx-auto mb-3" />
            <p className="text-white font-bold mb-2">{error.startsWith('Commande introuvable') ? 'Commande introuvable' : 'Suivi indisponible'}</p>
            <p className="text-ty-textMid text-sm">{error} Vous pouvez aussi <Link to="/support/contact" className="text-[#E10600] hover:underline">contacter le support</Link>.</p>
          </div>
        )}

        {result && <div className="mt-8 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs text-[#F2C94C]">{result.order_number}</p><h2 className="mt-2 text-xl font-bold text-white">Suivi de votre commande</h2></div><span className="rounded-full border border-[#303744] px-3 py-1 text-xs text-white">{FULFILLMENT_LABELS[result.fulfillment_status] || 'Suivi en cours'}</span></div>
          <dl className="mt-5 space-y-2 text-sm text-ty-textMid">
            <div><dt className="inline font-semibold text-white">Transporteur : </dt><dd className="inline">{result.carrier || 'À confirmer lors de l’expédition'}</dd></div>
            <div><dt className="inline font-semibold text-white">Numéro de suivi : </dt><dd className="inline break-all">{result.tracking_number || 'Communiqué lors de l’expédition'}</dd></div>
          </dl>
          <div className="mt-6">{(result.tracking_events || []).map((event, index) => <div key={event.id} className="relative grid grid-cols-[20px_1fr] gap-3 pb-6 last:pb-0"><div><span className={`block h-3 w-3 rounded-full ${index === result.tracking_events.length - 1 ? 'bg-[#E10600]' : 'bg-[#F2C94C]'}`}/>{index < result.tracking_events.length - 1 && <span className="ml-[5px] mt-1 block h-[calc(100%-8px)] w-px bg-[#232B3A]"/>}</div><div><p className="font-semibold text-white">{event.title}</p>{event.description && <p className="mt-1 text-sm text-ty-textMid">{event.description}</p>}{event.occurred_at && !Number.isNaN(Date.parse(event.occurred_at)) && <time className="mt-1 block font-mono text-[10px] text-ty-textLow">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.occurred_at))}</time>}</div></div>)}</div>{result.tracking_url && <a href={result.tracking_url} target="_blank" rel="noreferrer" className="ty-btn-primary mt-6 w-full">SUIVRE CHEZ LE TRANSPORTEUR</a>}</div>}

        <div className="mt-10 p-5 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C] mb-3">Vous avez reçu un email de suivi ?</p>
          <p className="text-ty-textMid text-sm">Si un lien transporteur vous a été adressé, consultez-le et vérifiez vos spams. En l’absence d’information confirmée, contactez TYMotors ; aucun envoi d’email ni suivi en temps réel n’est présumé.</p>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── CONFIDENTIALITÉ ──────────────────────────────────────────────────────────

export { PrivacyPage, TermsPage } from './LegalPages';
export { default as CookiesPage } from './CookiePolicy';
