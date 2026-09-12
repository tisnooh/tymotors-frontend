import React, { useState } from 'react';
import { toast } from 'sonner';
import { adminApi, date, errorMessage } from './api';
import { Badge, LoadState, PageTitle, Panel, Table, useData } from './ui';

export default function EmailCenter() {
  const center = useData('email-center');
  const subscribers = useData('newsletter-subscribers', { page: 1, limit: 25 });
  const [busy, setBusy] = useState('');
  async function retry(row) {
    setBusy(row.id);
    try { await adminApi.post(`email-logs/${row.id}/retry`, {}); toast.success('Nouvelle tentative effectuée'); center.reload(); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(''); }
  }
  return <><PageTitle title="Emails & newsletter" description="Suivi des consentements et des envois transactionnels. Aucune campagne n’est envoyée automatiquement."/>
    <LoadState state={center}>{data => <>
      <div className="ad-metrics">{[
        ['Abonnés actifs', data.newsletter.subscribed], ['Confirmations en attente', data.newsletter.pending],
        ['Désinscrits', data.newsletter.unsubscribed], ['Erreurs d’envoi', data.emails.failed],
      ].map(([label, value]) => <section className="ad-metric" key={label}><div><span>{label}</span></div><strong>{value}</strong></section>)}</div>
      <Panel title="Derniers emails"><Table items={data.recent} columns={[
        { label: 'Date', render: row => date(row.created_at) }, { label: 'Destinataire', render: row => row.recipient },
        { label: 'Type', render: row => row.email_type }, { label: 'Statut', render: row => <Badge value={row.status}/> },
        { label: 'Erreur / action', render: row => row.status === 'failed' && row.order_id ? <button className="ad-btn" disabled={busy === row.id} onClick={() => retry(row)}>{busy === row.id ? 'Tentative…' : 'Réessayer'}</button> : row.error_message || '—' },
      ]}/></Panel>
    </>}</LoadState>
    <Panel title="Abonnés newsletter"><LoadState state={subscribers}>{data => <Table items={data.items} columns={[
      { label: 'Email', render: row => row.email }, { label: 'Statut', render: row => <Badge value={row.status}/> },
      { label: 'Source du consentement', render: row => row.consent_source }, { label: 'Confirmation', render: row => date(row.confirmed_at) },
    ]}/>}</LoadState></Panel>
  </>;
}
