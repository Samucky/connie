/**
 * Cliente API reutilizable para el POS.
 * Si la página se abre desde file://, usa localhost:3000 para que el login funcione.
 */
const API_BASE = (typeof location !== 'undefined' && location.protocol === 'file:')
  ? 'http://localhost:3000/api'
  : '/api';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Error en la petición');
  return data;
}

const api = {
  inventario: {
    list: () => request('/inventario'),
    get: (id) => request(`/inventario/${id}`),
    create: (body) => request('/inventario', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/inventario/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/inventario/${id}`, { method: 'DELETE' }),
  },
  ventas: {
    list: () => request('/ventas'),
    get: (id) => request(`/ventas/${id}`),
    create: (body) => request('/ventas', { method: 'POST', body: JSON.stringify(body) }),
  },
  deudores: {
    list: () => request('/deudores'),
    get: (id) => request(`/deudores/${id}`),
    create: (body) => request('/deudores', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/deudores/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/deudores/${id}`, { method: 'DELETE' }),
  },
  pagos: {
    list: () => request('/pagos'),
    listByDeudor: (idDeudor) => request(`/pagos/deudor/${idDeudor}`),
    create: (body) => request('/pagos', { method: 'POST', body: JSON.stringify(body) }),
  },
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
};
