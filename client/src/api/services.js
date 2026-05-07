import { api } from './http.js';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (payload) => api.put('/auth/profile', payload).then((res) => res.data),
};

export const productApi = {
  list: (params) => api.get('/products', { params }).then((res) => res.data),
  get: (id) => api.get(`/products/${id}`).then((res) => res.data),
  create: (payload) => api.post('/products', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/products/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/products/${id}`).then((res) => res.data),
  review: (id, payload) => api.post(`/products/${id}/reviews`, payload).then((res) => res.data),
};

export const categoryApi = {
  list: () => api.get('/categories').then((res) => res.data),
  create: (payload) => api.post('/categories', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/categories/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
};

export const orderApi = {
  create: (payload) => api.post('/orders', payload).then((res) => res.data),
  userOrders: () => api.get('/orders/user').then((res) => res.data),
  adminOrders: () => api.get('/orders/admin').then((res) => res.data),
  stats: () => api.get('/orders/admin/stats').then((res) => res.data),
  updateStatus: (id, payload) =>
    api.put(`/orders/${id}/status`, payload).then((res) => res.data),
};

export const userApi = {
  list: () => api.get('/users').then((res) => res.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};
