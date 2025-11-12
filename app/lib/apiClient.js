import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';

// Ensure frontend requests include the '/api' prefix to match backend mounts.
// This avoids 404s when backend routes are mounted under /api/* (e.g. /api/receipts).
const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
const client = axios.create({ baseURL: `${normalizedBase}/api` });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
