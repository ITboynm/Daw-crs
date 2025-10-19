import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
});

let authToken = '';
let unauthorizedHandler = null;
let disable401Handler = false; // 临时禁用 401 处理器的开关

export function setAuthToken(token) {
  authToken = token || '';
}

export function clearAuthToken() {
  authToken = '';
}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

// 临时禁用 401 处理器（用于密钥轮转等特殊场景）
export function disable401Handling() {
  disable401Handler = true;
}

// 恢复 401 处理器
export function enable401Handling() {
  disable401Handler = false;
}

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (authToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !disable401Handler && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler(error);
    }
    return Promise.reject(error);
  },
);

export default http;
