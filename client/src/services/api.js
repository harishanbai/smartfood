import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('language') || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});

export const foodApi = {
  getFoods: (search = '') => api.get(`/foods?search=${encodeURIComponent(search)}`),
  addFood: (formData) => api.post('/foods', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateFood: (id, formData) => api.put(`/foods/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFood: (id) => api.delete(`/foods/${id}`),
  patchAvailability: (id, available) => api.patch(`/foods/${id}/availability`, { available })
};

export const menuApi = {
  getToday: () => api.get('/menu/today'),
  getTomorrow: () => api.get('/menu/tomorrow'),
  generateTomorrow: () => api.post('/menu/generate'),
  skipTomorrow: () => api.post('/menu/skip'),
  getHistory: (month = '', search = '') => api.get(`/menu/history?month=${month}&search=${encodeURIComponent(search)}`),
  assignMenu: (date, foodId) => api.post('/menu', { date, foodId }),
  deleteHistory: (id) => api.delete(`/menu/${id}`)
};

export const statsApi = {
  getStats: () => api.get('/stats')
};

export const tamilCalendarApi = {
  getToday: () => api.get('/tamil-calendar/today'),
  getTomorrow: () => api.get('/tamil-calendar/tomorrow'),
};

export default api;
