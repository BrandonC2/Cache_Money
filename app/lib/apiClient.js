import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';
import {
  clearStoredCredentials,
  notifySessionUnauthorized,
} from './authSession';

// Ensure frontend requests include the '/api' prefix to match backend mounts.
// This avoids 404s when backend routes are mounted under /api/* (e.g. /api/receipts).
const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
const client = axios.create({ baseURL: `${normalizedBase}/api` });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) return config;
  // Axios v1 uses AxiosHeaders; .set() reliably attaches auth on FormData/multipart (RN).
  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function shouldIgnoreUnauthorizedLogout(url) {
  const path = String(url || '');
  return (
    path.includes('/users/login') ||
    path.includes('/users/register')
  );
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (
      status === 401 &&
      !shouldIgnoreUnauthorizedLogout(url) &&
      !(error.config && error.config.skipAuthLogout === true)
    ) {
      await clearStoredCredentials();
      notifySessionUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default client;
