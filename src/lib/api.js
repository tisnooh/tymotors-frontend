import axios from 'axios';
import { getCachedAccessToken } from '@/lib/authSession';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://tymotors-backend-staging.onrender.com';
const API = `${BACKEND_URL}/api`;

// Get/generate persistent session id
function getSessionId() {
  let sid = localStorage.getItem('ty_session_id');
  if (!sid) {
    sid = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('ty_session_id', sid);
  }
  return sid;
}

export const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers['X-Session-Id'] = getSessionId();
  const token = getCachedAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const Brands = {
  list: () => api.get('/brands').then((r) => r.data),
  get: (slug) => api.get(`/brands/${slug}`).then((r) => r.data),
};

export const Categories = {
  list: () => api.get('/categories').then((r) => r.data),
  get: (slug) => api.get(`/categories/${slug}`).then((r) => r.data),
};

export const Products = {
  list: (params = {}) => api.get('/products', { params }).then((r) => r.data),
  get: (slug) => api.get(`/products/${slug}`).then((r) => r.data),
  checkCompatibility: (slug, vehicle) => api.post(`/products/${slug}/compatibility`, vehicle).then((r) => r.data),
};

export const Compatibility = {
  list: (brand) => api.get('/compatibility', { params: brand ? { brand } : {} }).then((r) => r.data),
};

export const Cart = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (product_id, quantity = 1, selected_vehicle = null) => api.post('/cart', { product_id, quantity, selected_vehicle }).then((r) => r.data),
  update: (product_id, quantity) => api.put('/cart', { product_id, quantity }).then((r) => r.data),
  remove: (product_id) => api.delete(`/cart/${product_id}`).then((r) => r.data),
  clear: () => api.delete('/cart').then((r) => r.data),
  claim: () => api.post('/cart/claim').then((r) => r.data),
};

export const Wishlist = {
  get: () => api.get('/wishlist').then((r) => r.data),
  add: (product_id) => api.post('/wishlist', { product_id }).then((r) => r.data),
  remove: (product_id) => api.delete(`/wishlist/${product_id}`).then((r) => r.data),
};

export const Newsletter = {
  signup: (email, locale = 'en', website = '') => api.post('/newsletter', { email, locale, website, consent_source: 'footer' }).then((r) => r.data),
  confirm: (token) => api.get('/newsletter/confirm', { params: { token } }).then((r) => r.data),
  unsubscribe: (token) => api.get('/newsletter/unsubscribe', { params: { token } }).then((r) => r.data),
};

export const AuthEmail = {
  forgot: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resend: (email) => api.post('/auth/resend-confirmation', { email }).then((r) => r.data),
  welcome: (first_name = null) => api.post('/auth/welcome', { first_name }).then((r) => r.data),
};

export const Contact = {
  send: (payload) => api.post('/contact', payload).then((r) => r.data),
};

export const Checkout = {
  create: () => {
    const promotion = new URLSearchParams(window.location.search).get('promo');
    return api.post('/create-checkout-session', null, { params: promotion ? { promotion_code: promotion } : {} }).then((r) => r.data);
  },
  get: (sessionId) => api.get(`/checkout-session/${encodeURIComponent(sessionId)}`).then((r) => r.data),
};

export const Account = {
  get: () => api.get('/me').then((r) => r.data),
  update: (payload) => api.patch('/me', payload).then((r) => r.data),
  orders: () => api.get('/me/orders').then((r) => r.data),
  emailPreferences: () => api.get('/me/email-preferences').then((r) => r.data),
  updateEmailPreferences: (newsletter) => api.patch('/me/email-preferences', { newsletter }).then((r) => r.data),
};
