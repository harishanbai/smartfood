import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
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
  getHistory: (month = '', search = '') => api.get(`/menu/history?month=${month}&search=${encodeURIComponent(search)}`)
};

export const statsApi = {
  getStats: () => api.get('/stats')
};

export default api;
