import axios from 'axios';

const api = axios.create({ baseURL: '/'});

export const processVideo = (url) => api.post('/api/process', { url });
export const fetchVideos = () => api.get('/api/videos');
export const fetchStudyPack = (youtubeId) => api.get(`/api/videos/${youtubeId}`);
export const saveSession = (payload) => api.post('/api/sessions', payload);
export const fetchDashboard = () => api.get('/api/dashboard');
