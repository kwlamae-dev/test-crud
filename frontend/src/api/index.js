import api from './client';

export const productApi = {
  list: () => api.get('/get_products').then((res) => res.data),
  get: (id) => api.get(`/get_product/${id}`).then((res) => res.data),
  create: (payload) => api.post('/add_product', payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/update_product/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/delete_product/${id}`).then((res) => res.data),
};

export const userApi = {
  list: () => api.get('/get_users').then((res) => res.data),
  get: (id) => api.get(`/get_user/${id}`).then((res) => res.data),
  create: (payload) => api.post('/add_user', payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/update_user/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/delete_user/${id}`).then((res) => res.data),
};

export const orderApi = {
  list: (params) => api.get('/get_orders', { params }).then((res) => res.data),
  get: (id) => api.get(`/get_order/${id}`).then((res) => res.data),
  byUser: (uid) => api.get(`/get_orders/user/${uid}`).then((res) => res.data),
  byProduct: (pid) =>
    api.get(`/get_orders/product/${pid}`).then((res) => res.data),
  create: (payload) => api.post('/add_order', payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/update_order/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/delete_order/${id}`).then((res) => res.data),
};
