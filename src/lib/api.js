import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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
};

export const Compatibility = {
  list: (brand) => api.get('/compatibility', { params: brand ? { brand } : {} }).then((r) => r.data),
};

export const Cart = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (product_id, quantity = 1) => api.post('/cart', { product_id, quantity }).then((r) => r.data),
  update: (product_id, quantity) => api.put('/cart', { product_id, quantity }).then((r) => r.data),
  remove: (product_id) => api.delete(`/cart/${product_id}`).then((r) => r.data),
  clear: () => api.delete('/cart').then((r) => r.data),
};

export const Wishlist = {
  get: () => api.get('/wishlist').then((r) => r.data),
  add: (product_id) => api.post('/wishlist', { product_id }).then((r) => r.data),
  remove: (product_id) => api.delete(`/wishlist/${product_id}`).then((r) => r.data),
};

export const Newsletter = {
  signup: (email, locale = 'en') => api.post('/newsletter', { email, locale }).then((r) => r.data),
};
