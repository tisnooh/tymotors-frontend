import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, Package, RotateCcw, HelpCircle, Truck, Shield, FileText, Cookie } from 'lucide-react';

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
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <PageLayout eyebrow="SUPPORT" title="Contact" subtitle="Une question ? Notre équipe vous répond sous 24h.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'support@tymotors.com' },
              { icon: Phone, label: 'Téléphone', value: '+33 1 00 00 00 00' },
              { icon: MapPin, label: 'Adresse', value: 'Paris, France' },
            ].map(({ icon: Icon, label, value }) => (
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
          </div>
        </div>

        <div>
          {sent ? (
            <div className="p-8 rounded-2xl border border-[#1a2a1a] bg-[#0a120a] text-center">
              <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Message envoyé !</h3>
              <p className="text-ty-textMid text-sm">Nous vous répondrons sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <button type="submit" className="ty-btn-primary w-full h-12 uppercase tracking-[0.18em] text-xs">
                Envoyer le message
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
    <PageLayout eyebrow="SUPPORT" title="Livraison" subtitle="Livraison rapide et sécurisée dans toute l'Europe.">
      <Section title="Zones de livraison">
        <p>TYMotors livre dans tous les pays de l'Union Européenne, ainsi qu'en Suisse, au Royaume-Uni et en Norvège.</p>
      </Section>
      <Section title="Délais">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { zone: 'France', délai: '2-3 jours ouvrés', prix: 'Gratuit dès 350€' },
            { zone: 'Europe', délai: '3-5 jours ouvrés', prix: 'À partir de 9,90€' },
            { zone: 'Express', délai: '24-48h', prix: 'À partir de 19,90€' },
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
        <p>• La livraison gratuite est automatiquement appliquée pour toute commande supérieure à 350€.</p>
        <p>• Un numéro de suivi vous sera envoyé par email dès l'expédition de votre colis.</p>
        <p>• Les commandes passées avant 14h sont expédiées le jour même (jours ouvrés).</p>
        <p>• TYMotors n'est pas responsable des retards causés par les douanes pour les livraisons hors UE.</p>
      </Section>
      <Section title="Transporteurs">
        <p>Nous travaillons avec DHL, Chronopost et UPS pour vous garantir les meilleures conditions de livraison.</p>
      </Section>
    </PageLayout>
  );
}

// ─── RETOURS ─────────────────────────────────────────────────────────────────

export function ReturnsPage() {
  return (
    <PageLayout eyebrow="SUPPORT" title="Retours" subtitle="30 jours pour changer d'avis, sans questions.">
      <Section title="Politique de retour">
        <p>Vous disposez de 30 jours à compter de la réception de votre commande pour retourner un article, sous réserve qu'il soit dans son état d'origine, non installé et dans son emballage d'origine.</p>
      </Section>
      <Section title="Comment effectuer un retour">
        <div className="space-y-4 mt-4">
          {[
            { step: '01', title: 'Contactez-nous', desc: "Envoyez un email à support@tymotors.com avec votre numéro de commande et la raison du retour." },
            { step: '02', title: 'Emballez l\'article', desc: "Remballez l'article soigneusement dans son emballage d'origine avec tous les accessoires." },
            { step: '03', title: 'Expédiez', desc: "Déposez le colis chez le transporteur de votre choix. Conservez le justificatif d'envoi." },
            { step: '04', title: 'Remboursement', desc: "Une fois l'article reçu et vérifié, le remboursement est effectué sous 5-7 jours ouvrés." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-4 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
              <span className="font-mono text-[#E10600] text-lg font-bold shrink-0">{step}</span>
              <div>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-ty-textMid text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Articles non retournables">
        <p>• Articles installés ou montés sur un véhicule</p>
        <p>• Articles endommagés par une mauvaise installation</p>
        <p>• Articles commandés sur mesure ou personnalisés</p>
      </Section>
    </PageLayout>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "Comment savoir si un produit est compatible avec mon véhicule ?", a: "Utilisez notre configurateur de compatibilité sur la page Personnaliser. Sélectionnez votre marque, modèle et génération pour voir tous les produits compatibles." },
  { q: "Quels sont les délais de livraison ?", a: "En France : 2-3 jours ouvrés. En Europe : 3-5 jours ouvrés. Livraison express disponible en 24-48h. Les commandes passées avant 14h sont expédiées le jour même." },
  { q: "La livraison est-elle gratuite ?", a: "Oui, la livraison est gratuite pour toute commande supérieure à 350€ en France et dans l'Union Européenne." },
  { q: "Puis-je retourner un article ?", a: "Oui, vous avez 30 jours pour retourner un article non installé dans son état d'origine. Contactez-nous à support@tymotors.com pour initier un retour." },
  { q: "Les produits sont-ils garantis ?", a: "Tous nos produits bénéficient d'une garantie de 2 ans contre les défauts de fabrication. La garantie ne couvre pas les dommages liés à une mauvaise installation." },
  { q: "Comment suivre ma commande ?", a: "Un email avec votre numéro de suivi vous sera envoyé dès l'expédition. Vous pouvez également suivre votre commande depuis la page Suivi de commande." },
  { q: "Les produits nécessitent-ils une installation professionnelle ?", a: "Certains produits peuvent être installés en DIY, d'autres nécessitent un professionnel. Chaque fiche produit indique le niveau d'installation requis." },
  { q: "Acceptez-vous les paiements en plusieurs fois ?", a: "Oui, nous proposons le paiement en 3 ou 4 fois sans frais via Stripe pour les commandes supérieures à 150€." },
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
        <p className="text-white font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</p>
        <p className="text-ty-textMid text-sm mb-4">Notre équipe est disponible du lundi au vendredi, 9h-18h.</p>
        <Link to="/support/contact" className="ty-btn-primary text-xs uppercase tracking-[0.18em] px-6 h-10 inline-flex items-center">
          Contacter le support
        </Link>
      </div>
    </PageLayout>
  );
}

// ─── SUIVI DE COMMANDE ────────────────────────────────────────────────────────

export function TrackPage() {
  const [orderNum, setOrderNum] = useState('');
  const [searched, setSearched] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
  }

  return (
    <PageLayout eyebrow="SUPPORT" title="Suivi de commande" subtitle="Retrouvez l'état de votre commande en temps réel.">
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
          <button type="submit" className="ty-btn-primary w-full h-12 uppercase tracking-[0.18em] text-xs">
            Rechercher
          </button>
        </form>

        {searched && (
          <div className="mt-8 p-6 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] text-center">
            <Package className="h-8 w-8 text-ty-textMid mx-auto mb-3" />
            <p className="text-white font-bold mb-2">Commande introuvable</p>
            <p className="text-ty-textMid text-sm">Vérifiez votre numéro de commande ou <Link to="/support/contact" className="text-[#E10600] hover:underline">contactez-nous</Link>.</p>
          </div>
        )}

        <div className="mt-10 p-5 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F2C94C] mb-3">Vous avez reçu un email de suivi ?</p>
          <p className="text-ty-textMid text-sm">Un lien de suivi DHL/Chronopost/UPS vous a été envoyé par email lors de l'expédition. Vérifiez également vos spams.</p>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── CONFIDENTIALITÉ ──────────────────────────────────────────────────────────

export function PrivacyPage() {
  return (
    <PageLayout eyebrow="LÉGAL" title="Confidentialité" subtitle="Comment nous protégeons vos données personnelles.">
      <Section title="Collecte des données">
        <p>TYMotors collecte uniquement les données nécessaires au traitement de vos commandes et à l'amélioration de votre expérience : nom, email, adresse de livraison et informations de paiement (traitées par Stripe, sans stockage de vos données bancaires chez nous).</p>
      </Section>
      <Section title="Utilisation des données">
        <p>Vos données sont utilisées pour :</p>
        <p>• Traiter et livrer vos commandes</p>
        <p>• Vous envoyer les confirmations et mises à jour de commandes</p>
        <p>• Vous envoyer notre newsletter si vous y avez consenti</p>
        <p>• Améliorer nos services et notre site</p>
      </Section>
      <Section title="Partage des données">
        <p>TYMotors ne vend jamais vos données personnelles. Elles peuvent être partagées avec nos partenaires de livraison (DHL, Chronopost, UPS) et notre prestataire de paiement (Stripe) uniquement dans le cadre du traitement de vos commandes.</p>
      </Section>
      <Section title="Vos droits">
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@tymotors.com" className="text-[#E10600] hover:underline">privacy@tymotors.com</a>.</p>
      </Section>
      <Section title="Cookies">
        <p>Nous utilisons des cookies essentiels au fonctionnement du site et des cookies analytiques pour améliorer votre expérience. Vous pouvez gérer vos préférences depuis notre <Link to="/legal/cookies" className="text-[#E10600] hover:underline">politique de cookies</Link>.</p>
      </Section>
      <p className="text-ty-textLow text-xs mt-8">Dernière mise à jour : Juin 2026</p>
    </PageLayout>
  );
}

// ─── CONDITIONS ───────────────────────────────────────────────────────────────

export function TermsPage() {
  return (
    <PageLayout eyebrow="LÉGAL" title="Conditions générales" subtitle="Conditions d'utilisation et de vente TYMotors.">
      <Section title="1. Objet">
        <p>Les présentes conditions générales régissent l'utilisation du site tymotors.com et les achats effectués sur celui-ci. En utilisant ce site, vous acceptez ces conditions dans leur intégralité.</p>
      </Section>
      <Section title="2. Produits et prix">
        <p>TYMotors se réserve le droit de modifier ses prix à tout moment. Les prix affichés sont en euros TTC. Les commandes sont facturées au prix en vigueur au moment de la validation.</p>
      </Section>
      <Section title="3. Commandes">
        <p>Toute commande validée constitue un contrat de vente entre TYMotors et l'acheteur. TYMotors se réserve le droit d'annuler une commande en cas de stock insuffisant, d'erreur de prix manifeste ou de fraude suspectée.</p>
      </Section>
      <Section title="4. Paiement">
        <p>Les paiements sont sécurisés par Stripe. TYMotors accepte les cartes bancaires Visa, Mastercard et American Express, ainsi que le paiement en plusieurs fois sans frais.</p>
      </Section>
      <Section title="5. Garantie">
        <p>Tous les produits TYMotors bénéficient d'une garantie légale de 2 ans conformément à la directive européenne sur la vente de biens. La garantie couvre les défauts de fabrication mais pas les dommages liés à une installation incorrecte.</p>
      </Section>
      <Section title="6. Responsabilité">
        <p>TYMotors ne saurait être tenu responsable des dommages indirects liés à l'utilisation de ses produits. L'installation de pièces automobiles peut nécessiter l'intervention d'un professionnel qualifié.</p>
      </Section>
      <Section title="7. Droit applicable">
        <p>Les présentes conditions sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux de Paris.</p>
      </Section>
      <p className="text-ty-textLow text-xs mt-8">Dernière mise à jour : Juin 2026</p>
    </PageLayout>
  );
}

// ─── COOKIES ─────────────────────────────────────────────────────────────────

export function CookiesPage() {
  const [prefs, setPrefs] = useState({ essential: true, analytics: true, marketing: false });

  return (
    <PageLayout eyebrow="LÉGAL" title="Cookies" subtitle="Gestion de vos préférences de cookies.">
      <Section title="Qu'est-ce qu'un cookie ?">
        <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur notre site. Il nous permet de mémoriser vos préférences et d'améliorer votre expérience.</p>
      </Section>

      <Section title="Gérer vos préférences">
        <div className="space-y-4 mt-4">
          {[
            { key: 'essential', label: 'Cookies essentiels', desc: 'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.', locked: true },
            { key: 'analytics', label: 'Cookies analytiques', desc: 'Nous aident à comprendre comment vous utilisez le site (pages visitées, temps passé).', locked: false },
            { key: 'marketing', label: 'Cookies marketing', desc: 'Permettent de vous proposer des publicités personnalisées sur d\'autres sites.', locked: false },
          ].map(({ key, label, desc, locked }) => (
            <div key={key} className="flex items-start gap-4 p-4 rounded-xl border border-[#151A23] bg-[#0A0B0E]">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-ty-textMid text-sm mt-1">{desc}</p>
              </div>
              <button
                type="button"
                disabled={locked}
                onClick={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                className={`relative h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 ${prefs[key] ? 'bg-[#E10600]' : 'bg-[#232B3A]'} ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="ty-btn-primary mt-6 h-11 px-8 text-xs uppercase tracking-[0.18em]">
          Enregistrer mes préférences
        </button>
      </Section>
      <p className="text-ty-textLow text-xs mt-8">Dernière mise à jour : Juin 2026</p>
    </PageLayout>
  );
}
