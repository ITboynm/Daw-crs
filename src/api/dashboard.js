import http from '@/utils/httpClient';

export function getStatus() {
  return http.get('/dashboard/status');
}

export function getInfo() {
  return http.get('/dashboard/info');
}

export function getUsage(params = {}) {
  return http.get('/dashboard/bill', { params });
}

export function getLogs(params = {}) {
  return http.get('/dashboard/logs', { params });
}

export function getNews() {
  return http.get('/dashboard/news');
}

export function getConfigSnapshot() {
  return http.get('/dashboard/conf');
}

export function getModels() {
  return http.get('/dashboard/models');
}

export function getLiveStatusWithKey(apiKey) {
  return http.get('/dashboard/live', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
