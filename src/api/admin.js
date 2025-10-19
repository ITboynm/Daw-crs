import http from '@/utils/httpClient';

export function getConfig() {
  return http.get('/x-config');
}

export function updateConfig(payload) {
  return http.put('/x-config', payload);
}

export function deleteConfig(keys = []) {
  return http.delete('/x-config', { data: { keys } });
}

export function getConfState() {
  return http.get('/x-conf');
}

export function sendNews(dnaPath, payload) {
  return http.post(`/x-news/${encodeURIComponent(dnaPath)}`, payload);
}

export function deleteNews(newsId) {
  return http.delete(`/x-news/${encodeURIComponent(newsId)}`);
}
