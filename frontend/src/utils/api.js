const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const api = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const authAPI = {
  signup: (body) => api('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signin: (body) => api('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const herbAPI = {
  create: (body) => api('/herbs', { method: 'POST', body: JSON.stringify(body) }),
  updateQR: (id, body) => api(`/herbs/${id}/qr`, { method: 'PATCH', body: JSON.stringify(body) }),
  getById: (id) => api(`/herbs/${id}`),
  getMy: () => api('/herbs/my'),
  getByArea: () => api('/herbs/area'),
};

export const transportAPI = {
  create: (body) => api('/transport', { method: 'POST', body: JSON.stringify(body) }),
  updateQR: (id, body) => api(`/transport/${id}/qr`, { method: 'PATCH', body: JSON.stringify(body) }),
  getById: (id) => api(`/transport/${id}`),
  getMy: () => api('/transport/my'),
  getByArea: () => api('/transport/area'),
};

export const labAPI = {
  create: (body) => api('/lab', { method: 'POST', body: JSON.stringify(body) }),
  updateQR: (id, body) => api(`/lab/${id}/qr`, { method: 'PATCH', body: JSON.stringify(body) }),
  getById: (id) => api(`/lab/${id}`),
  getMy: () => api('/lab/my'),
  getByArea: () => api('/lab/area'),
};

export const manufactureAPI = {
  create: (body) => api('/manufacture', { method: 'POST', body: JSON.stringify(body) }),
  updateQR: (id, body) => api(`/manufacture/${id}/qr`, { method: 'PATCH', body: JSON.stringify(body) }),
  dispatch: (id) => api(`/manufacture/${id}/dispatch`, { method: 'PATCH' }),  // ← ADD THIS LINE
  getById: (id) => api(`/manufacture/${id}`),
  getMy: () => api('/manufacture/my'),
  getConsumer: (id) => api(`/manufacture/consumer/${id}`),
};

export const govAPI = {
  stats: () => api('/government/stats'),
  users: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/government/users?${q}`);
  },
};

export default api;
