import http from '@/utils/httpClient';

export function createUser(payload) {
  return http.post('/x-users', payload);
}

export function listUsers(params = {}) {
  return http.get('/x-users', { params });
}

export function getUser(identifier) {
  return http.get(`/x-users/${encodeURIComponent(identifier)}`);
}

export function updateUser(identifier, payload) {
  return http.put(`/x-users/${encodeURIComponent(identifier)}`, payload);
}

export function postUserXCredit(identifier, payload) {
  return http.post(`/x-users/${encodeURIComponent(identifier)}`, payload);
}

export function deleteUser(identifier) {
  return http.delete(`/x-users/${encodeURIComponent(identifier)}`);
}

export function getDescendants(params = {}) {
  return http.get('/x-dna', { params });
}

export function getDescendant(identifier) {
  return http.get(`/x-dna/${encodeURIComponent(identifier)}`);
}

export function rotateSelfKey(payload = { confirm: true }) {
  return http.post('/x-self', payload);
}

export function resetUserKey(apiKey, confirmParam) {
  return http.post('/x-self', { confirm: confirmParam }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
}

export function getBillAnalytics(params = {}) {
  return http.get('/x-bill', { params });
}
