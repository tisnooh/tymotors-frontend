import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Cart, Checkout, getSessionId } from '@/lib/api';
import { acceptedQuote, cartQuoteFingerprint, deliveryOptions, destinationInput, EMPTY_DESTINATION,
  futureExpiry, secureRequestKey, testCheckoutUrl } from '@/lib/cartQuote';

export default function useCartQuote(cart) {
  const { user, loading: authLoading } = useAuth();
  const owner = user?.id ? `user:${user.id}` : `guest:${getSessionId()}`;
  const ownerVersion = useRef({ owner, version: 0 });
  if (ownerVersion.current.owner !== owner) {
    ownerVersion.current = { owner, version: ownerVersion.current.version + 1 };
  }
  const addressOwner = JSON.stringify([owner, ownerVersion.current.version]);
  const [address, setAddress] = useState({ owner: addressOwner, values: EMPTY_DESTINATION });
  const [revision, setRevision] = useState(0);
  const destination = address.owner === addressOwner ? address.values : EMPTY_DESTINATION;
  const facts = JSON.stringify([addressOwner, authLoading, cartQuoteFingerprint(cart), destination, revision]);
  const generation = useRef({ facts, version: 0 });
  if (generation.current.facts !== facts) {
    generation.current = { facts, version: generation.current.version + 1 };
  }
  // Never resurrect an earlier approval when A -> B -> A produces equal facts.
  const scope = JSON.stringify([generation.current.version, facts]);
  const current = useRef(scope); current.current = scope;
  const alive = useRef(true);
  const operation = useRef(null);
  const quoteKey = useRef(null);
  const [state, setState] = useState(null);
  const paymentLocks = useRef(new Set());
  const [, updatePaymentLock] = useState(0);
  const [clock, tick] = useState(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const view = state?.scope === scope ? state : null;
  const holding = paymentLocks.current.has(owner);
  const isCurrent = token => alive.current && current.current === token.scope && operation.current === token;
  const begin = kind => {
    if (authLoading || paymentLocks.current.has(owner) || operation.current?.scope === scope) return null;
    const token = { scope, kind }; operation.current = token;
    setState(previous => ({ ...(kind !== 'options' && previous?.scope === scope ? previous : {}),
      scope, busy: kind, error: '', ...(kind === 'payment' ? {} : { quote: null, paymentKey: null }) }));
    return token;
  };
  const finish = (token, update) => {
    if (isCurrent(token)) { operation.current = null; setState({ scope, busy: null, ...update }); }
  };
  let quote = view?.quote || null;
  let options = view?.options || [];
  try {
    if (quote) futureExpiry(quote.expires_at);
    if (options.length) options.forEach(option => futureExpiry(option.expires_at));
  } catch { quote = null; options = []; }
  const expired = !!view && ((view.quote && !quote) || (view.options?.length && !options.length));
  useEffect(() => {
    const expiries = [view?.quote?.expires_at, ...(view?.options || []).map(option => option.expires_at)]
      .filter(Boolean).map(Date.parse).filter(Number.isFinite);
    const future = expiries.filter(time => time > Date.now());
    if (!future.length) return undefined;
    const delay = Math.min(60000, Math.max(0, Math.min(...future) - Date.now()));
    const timer = setTimeout(() => tick(value => value + 1), delay + 1);
    return () => clearTimeout(timer);
  }, [view, clock]);
  const calculate = async () => {
    const token = begin('options'); if (!token) return;
    try {
      const clean = destinationInput(destination);
      const available = deliveryOptions(await Cart.deliveryOptions(clean));
      finish(token, { options: available, mode: available.length === 1 ? available[0].mode : '', batch: secureRequestKey(),
        error: available.length ? '' : 'Aucune livraison vérifiée n’est disponible pour ce panier et cette adresse.' });
    } catch { finish(token, { options: [], error: 'Impossible de calculer la livraison. Vérifiez votre adresse ou réessayez plus tard.' }); }
  };
  const confirm = async () => {
    const option = options.find(item => item.mode === view?.mode);
    if (!option) return;
    const token = begin('quote'); if (!token) return;
    try {
      const context = JSON.stringify([scope, view.batch, option.mode]);
      if (quoteKey.current?.context !== context) quoteKey.current = { context, key: secureRequestKey() };
      const result = await Cart.quote({ request_key: quoteKey.current.key, destination: destinationInput(destination), mode: option.mode });
      const verified = acceptedQuote(result, cart, option);
      finish(token, { options, mode: option.mode, batch: view.batch, quote: verified, paymentKey: secureRequestKey() });
    } catch { finish(token, { options: [], error: 'Le devis n’a pas été confirmé. Recalculez la livraison avant de poursuivre.' }); }
  };
  const checkout = async () => {
    if (!quote?.checkout_available || paymentLocks.current.has(owner)) return null;
    try { futureExpiry(quote.expires_at); } catch { setState(null); return null; }
    const token = begin('payment'); if (!token) return null;
    // Even a failed/aborted network request may have created a Stripe session.
    // Freeze this owner's checkout until inspection; never rotate and retry.
    paymentLocks.current.add(owner); updatePaymentLock(value => value + 1);
    try {
      const result = await Checkout.createQuoted(quote.quote_id, view.paymentKey);
      if (!isCurrent(token)) return null;
      futureExpiry(quote.expires_at);
      if (result?.is_test === true && result.quote_id === quote.quote_id
          && ['paid', 'awaiting_webhook'].includes(result.status)) {
        finish(token, { ...view, error: 'Ce paiement nécessite une vérification de son statut avant toute nouvelle tentative.' });
        return null;
      }
      const url = testCheckoutUrl(result, quote.quote_id);
      finish(token, { ...view });
      return url;
    } catch {
      finish(token, { ...view, error: 'Le statut du paiement doit être vérifié. Ne recommencez pas le paiement.' });
      return null;
    }
  };
  return { destination, setField: (field, value) => {
    if (!holding && field !== 'country' && Object.prototype.hasOwnProperty.call(EMPTY_DESTINATION, field)) {
      operation.current = null;
      setAddress(previous => ({ owner: addressOwner, values: { ...(previous.owner === addressOwner ? previous.values : EMPTY_DESTINATION), [field]: value } }));
    }
  }, options, mode: options.some(item => item.mode === view?.mode) ? view.mode : '',
  setMode: mode => { if (!holding && options.some(option => option.mode === mode)) {
    operation.current = null; setState({ scope, options, mode, batch: view.batch });
  } }, quote, calculate, confirm, checkout, busy: view?.busy || null,
  invalidate: () => { operation.current = null; current.current = ''; setState(null); setRevision(value => value + 1); },
  error: view?.error || (holding ? 'Vérifiez la commande en cours avant tout nouveau paiement.'
    : expired ? 'Le devis ou le tarif de livraison a expiré. Recalculez la livraison.'
      : quote && !quote.checkout_available ? 'Le paiement de test n’est pas disponible pour ce devis.' : ''), holding,
  authLoading, ready: !!quote?.checkout_available && !view?.busy && !holding && !authLoading };
}
