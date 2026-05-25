import axios from 'axios';
import { getStoredUser } from './auth';

const api = axios.create({ baseURL: '/'});

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user?.id) {
    config.headers['x-user-id'] = user.id;
  }

  return config;
});

export const processVideo = (url) => api.post('/api/process', { url });
export const fetchVideos = () => api.get('/api/videos');
export const fetchStudyPack = (youtubeId) => api.get(`/api/videos/${youtubeId}`);
export const saveSession = (payload) => api.post('/api/sessions', payload);
export const fetchDashboard = () => api.get('/api/dashboard');
export const loginUser = (credentials) => api.post('/api/auth/login', credentials);
export const signupUser = (payload) => api.post('/api/auth/signup', payload);
