import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import http, { setAuthToken, clearAuthToken } from '@/utils/httpClient';

const STORAGE_KEY = 'dawapi:api-key';

function extractErrorMessage(error, fallback = '请求失败') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const responseMessage = error?.response?.data?.message || error?.response?.data?.error;
  if (responseMessage) return responseMessage;
  return error.message || fallback;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    apiKey: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || '' : '',
    status: null,
    profile: null,
    loading: false,
    initialized: false,
    error: null,
    lastStatusFetchedAt: null,
    lastProfileFetchedAt: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.apiKey),
    isAdmin: (state) => state.status?.admin === true,
    canManage: (state) => state.status?.manage === true || state.status?.admin === true,
    isRoot: (state) => state.status?.name === 'root',
    displayName: (state) => state.profile?.alias || state.status?.alias || state.status?.name || '访客',
    balance: (state) => state.profile?.balance ?? 0,
  },
  actions: {
    async bootstrap() {
      if (this.initialized) return;
      if (this.apiKey) {
        setAuthToken(this.apiKey);
        try {
          await this.refreshSession();
        } catch (error) {
          this.clearSession(false);
          console.warn('Session bootstrap failed:', error);
        }
      }
      this.initialized = true;
    },
    async login(apiKey) {
      const trimmed = (apiKey || '').trim();
      if (!trimmed) {
        throw new Error('请输入 API Key');
      }

      if (!trimmed.startsWith('sk-')) {
        throw new Error('API Key 格式不正确');
      }

      this.loading = true;
      this.error = null;

      try {
        setAuthToken(trimmed);
        this.apiKey = trimmed;
        const status = await this.fetchStatus(true);
        localStorage.setItem(STORAGE_KEY, trimmed);
        await this.fetchProfile(true);
        this.error = null;
        return status;
      } catch (error) {
        clearAuthToken();
        this.clearSession(false);
        throw new Error(extractErrorMessage(error, '登录失败'));
      } finally {
        this.loading = false;
      }
    },
    async refreshSession() {
      if (!this.apiKey) return null;
      await this.fetchStatus(true);
      await this.fetchProfile();
      return this.status;
    },
    async fetchStatus(force = false) {
      if (!this.apiKey) throw new Error('未登录');
      const now = dayjs();

      if (!force && this.lastStatusFetchedAt && now.diff(this.lastStatusFetchedAt, 'minute') < 5) {
        return this.status;
      }

      const response = await http.get('/dashboard/status');
      this.status = response.data;
      this.lastStatusFetchedAt = now;
      return this.status;
    },
    async fetchProfile(force = false) {
      if (!this.apiKey) throw new Error('未登录');
      const now = dayjs();

      if (!force && this.lastProfileFetchedAt && now.diff(this.lastProfileFetchedAt, 'minute') < 10) {
        return this.profile;
      }

      const response = await http.get('/dashboard/info');
      this.profile = response.data;
      this.lastProfileFetchedAt = now;
      return this.profile;
    },
    async logout() {
      this.clearSession();
    },
    clearSession(clearStorage = true) {
      this.status = null;
      this.profile = null;
      this.apiKey = '';
      this.error = null;
      this.lastProfileFetchedAt = null;
      this.lastStatusFetchedAt = null;
      clearAuthToken();
      if (clearStorage && typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    handleUnauthorized() {
      this.clearSession();
      this.error = '登录状态已过期，请重新登录';
    },
  },
});
