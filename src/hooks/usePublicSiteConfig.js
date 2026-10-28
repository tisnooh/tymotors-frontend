import { useEffect, useState } from 'react';
import { SiteConfig } from '@/lib/api';

export const LEGAL_FIELDS = ['company_name', 'legal_form', 'siret', 'registration', 'address', 'contact_email',
  'contact_phone', 'vat_mention', 'publication_director', 'mediator_name', 'mediator_url', 'mediator_address',
  'hosting_details', 'returns_address'];

export function publicSiteConfig(response) {
  const legal = Object.fromEntries(LEGAL_FIELDS.map(field => [field,
    Object.prototype.hasOwnProperty.call(response?.legal || {}, field) && typeof response.legal[field] === 'string'
      ? response.legal[field].trim() : '']));
  return {
    legal,
    // A completeness warning is not legal approval or commercial activation.
    legal_ready: response?.legal_ready === true && LEGAL_FIELDS.every(field => !!legal[field]),
    stripe_mode: ['test', 'live'].includes(response?.stripe_mode) ? response.stripe_mode : null,
  };
}

export default function usePublicSiteConfig() {
  const [config, setConfig] = useState(() => publicSiteConfig(null));
  useEffect(() => {
    let current = true;
    SiteConfig.get().then(response => { if (current) setConfig(publicSiteConfig(response)); }).catch(() => {});
    return () => { current = false; };
  }, []);
  return config;
}
