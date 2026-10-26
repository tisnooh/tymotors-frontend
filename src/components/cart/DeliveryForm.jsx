import React from 'react';
import { formatPrice } from '@/lib/format';

const fields = [
  ['name', 'Nom complet', 'name', 160, true], ['line1', 'Adresse', 'address-line1', 200, true],
  ['line2', 'Complément d’adresse', 'address-line2', 200, false], ['postal_code', 'Code postal', 'postal-code', 5, true],
  ['city', 'Ville', 'address-level2', 100, true], ['state', 'Région / département (facultatif)', 'address-level1', 100, false],
  ['phone', 'Téléphone (facultatif)', 'tel', 40, false],
];
const inputClass = 'mt-2 w-full rounded-xl border border-[#232B3A] bg-[#0F1115] px-4 py-3 text-sm text-white outline-none focus:border-[#F2C94C] disabled:opacity-50';

export default function DeliveryForm({ delivery, language }) {
  return <section data-testid="cart-delivery" className="mt-8 rounded-2xl border border-[#232B3A] bg-[#0A0B0E] p-6" aria-labelledby="cart-delivery-heading">
    <h2 id="cart-delivery-heading" className="font-mono text-[10px] tracking-[0.32em] uppercase text-[#F2C94C]/80 mb-5">Livraison</h2>
    <form onSubmit={event => { event.preventDefault(); delivery.calculate(); }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([field, label, autoComplete, maxLength, required]) => <label key={field} className="text-sm text-ty-textMid">
          {label}<input data-testid={`delivery-${field}`} name={field} autoComplete={autoComplete} required={required}
            type={field === 'phone' ? 'tel' : 'text'} inputMode={field === 'postal_code' ? 'numeric' : undefined}
            pattern={field === 'postal_code' ? '[0-9]{5}' : undefined} maxLength={maxLength}
            value={delivery.destination[field]} onChange={event => delivery.setField(field, event.target.value)}
            disabled={delivery.holding || delivery.authLoading} className={inputClass} />
        </label>)}
        <label className="text-sm text-ty-textMid">Pays<select data-testid="delivery-country" name="country" value="FR" disabled className={inputClass}><option value="FR">France</option></select></label>
      </div>
      <button data-testid="delivery-calculate" type="submit" disabled={!!delivery.busy || delivery.holding || delivery.authLoading}
        className="mt-5 ty-btn-line h-11 px-5 text-xs uppercase tracking-[0.18em] disabled:opacity-50">
        {delivery.busy === 'options' ? 'Calcul en cours…' : 'Calculer la livraison'}
      </button>
    </form>
    {!!delivery.options.length && <div className="mt-5">
      <label className="text-sm text-ty-textMid">Mode de livraison<select data-testid="delivery-mode" value={delivery.mode}
        onChange={event => delivery.setMode(event.target.value)} disabled={!!delivery.busy || delivery.holding} className={inputClass}>
        <option value="">Choisissez un mode</option>
        {delivery.options.map(option => <option key={option.mode} value={option.mode}
          label={`${option.mode} — ${formatPrice(option.shipping_cents / 100, option.currency, language)}`} />)}
      </select></label>
      <button data-testid="delivery-confirm" type="button" onClick={delivery.confirm}
        disabled={!delivery.mode || !!delivery.busy || delivery.holding || delivery.authLoading}
        className="mt-4 ty-btn-line h-11 px-5 text-xs uppercase tracking-[0.18em] disabled:opacity-50">
        {delivery.busy === 'quote' ? 'Vérification en cours…' : 'Confirmer le devis'}
      </button>
    </div>}
    {delivery.quote && <p role="status" className="mt-4 text-xs text-[#F2C94C]">Devis vérifié pour cette adresse et ce panier. Il sera contrôlé de nouveau avant le paiement de test.</p>}
    {delivery.error && <p role="alert" data-testid="delivery-error" className="mt-4 text-sm text-[#F2C94C]">{delivery.error}</p>}
  </section>;
}
