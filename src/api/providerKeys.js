import http from '@/utils/httpClient';

export function listProviderKeys(params = {}) {
  return http.get('/x-keys', { params });
}

export function createProviderKey(payload) {
  return http.post('/x-keys', payload);
}

export function getProviderKey(id) {
  return http.get(`/x-keys/${encodeURIComponent(id)}`);
}

export function updateProviderKey(id, payload) {
  return http.put(`/x-keys/${encodeURIComponent(id)}`, payload);
}

export function deleteProviderKey(id) {
  return http.delete(`/x-keys/${encodeURIComponent(id)}`);
}

// 获取系统配置和密钥状态(包括休眠情况)
export function getProviderKeysConfig() {
  return http.get('/x-conf');
}
