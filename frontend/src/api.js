// The frontend talks ONLY to the Render backend. It never touches MongoDB directly.
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection, or wait a minute if the server is waking up.');
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // response was not JSON
  }

  if (!response.ok || (body && body.success === false)) {
    const detail = body && body.errors && body.errors.length ? body.errors.join(' ') : body && body.message;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return body;
}

const enc = encodeURIComponent;

export const api = {
  health: () => request('/health'),
  list: (search = '') => request(`/students${search ? `?search=${enc(search)}` : ''}`),
  get: (id) => request(`/students/${enc(id)}`),
  create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/students/${enc(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/students/${enc(id)}`, { method: 'DELETE' }),
};
