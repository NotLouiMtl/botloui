const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function request(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error' }));
    throw new Error(err.message || err.error || 'Error de conexión');
  }

  return res.json();
}

export const api = {
  login: (telegramId: string, password: string) =>
    request('/admin/login', { method: 'POST', body: JSON.stringify({ telegramId, password }) }),

  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  getStock: () => request('/admin/stock'),
  getServices: () => request('/admin/services'),

  addBalance: (telegramId: string, amount: number) =>
    request('/admin/add-balance', { method: 'POST', body: JSON.stringify({ telegramId, amount }) }),

  blockUser: (telegramId: string) =>
    request('/admin/block-user', { method: 'POST', body: JSON.stringify({ telegramId }) }),

  createAccount: (data: { serviceId: number; email: string; password: string; pin?: string; profiles?: number; profilePins?: (string | undefined)[] }) =>
    request('/admin/create-account', { method: 'POST', body: JSON.stringify(data) }),

  createService: (data: { name: string; price: number }) =>
    request('/admin/services', { method: 'POST', body: JSON.stringify(data) }),

  updateService: (id: number, data: { price?: number; active?: boolean }) =>
    request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: number) =>
    request(`/admin/services/${id}`, { method: 'DELETE' }),

  getTransactions: () => request('/admin/transactions'),
  makeAdmin: (telegramId: string, password: string, username?: string) =>
    request('/admin/make-admin', { method: 'POST', body: JSON.stringify({ telegramId, password, username }) }),
};
