import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
