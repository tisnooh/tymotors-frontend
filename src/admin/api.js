import { api } from '@/lib/api';

export const adminApi = {
  get: (path, params, signal) => api.get(`/admin/${path}`, { params, signal }).then(r => r.data),
  post: (path, data) => api.post(`/admin/${path}`, data).then(r => r.data),
  put: (path, data) => api.put(`/admin/${path}`, data).then(r => r.data),
  patch: (path, data) => api.patch(`/admin/${path}`, data).then(r => r.data),
  remove: path => api.delete(`/admin/${path}`).then(r => r.data),
  upload: file => {
    const data = new FormData();
    data.append('file', file);
    return api.post('/admin/upload-image', data, { headers: { 'Content-Type': undefined } }).then(r => r.data);
  },
};

export function errorMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return 'Session expirée. Reconnectez-vous.';
  if (status === 403) return 'Accès réservé aux administrateurs.';
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map(e => `${e.loc?.slice(1).join('.') || 'Formulaire'} : ${e.msg}`).join(' · ');
  return typeof detail === 'string' ? detail : error.message || 'Une erreur est survenue. Réessayez.';
}

export const money = cents => cents == null ? 'Non disponible' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export const date = value => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
export const labels = {
  pending: 'Nouvelle', paid: 'Payée', unpaid: 'Non payée', failed: 'Échoué', payment_failed: 'Paiement échoué',
  unfulfilled: 'À préparer', processing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée',
  cancelled: 'Annulée', refunded: 'Remboursée', requires_review: 'À vérifier',
  active: 'Actif', draft: 'Brouillon', archived: 'Archivé', low: 'Stock faible', out: 'Rupture', available: 'En stock',
  requested: 'Demande reçue', review: 'À valider', accepted: 'Accepté', received: 'Produit reçu', rejected: 'Refusé',
  unpublished: 'Non publié', published: 'Publié', to_publish: 'À publier', needs_update: 'À mettre à jour', error: 'Erreur',
};
