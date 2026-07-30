import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://doorbell-spry-judgingly.ngrok-free.dev/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(async (config) => {
  const lang = localStorage.getItem('language') || 'en';
  config.headers['Accept-Language'] = lang;

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-user-uid'] = auth.currentUser.uid;
      config.headers['x-user-email'] = auth.currentUser.email || '';
    } catch (error) {
      console.error("Error fetching Firebase ID token:", error);
    }
  } else {
    // Fallback if auth.currentUser is not yet populated
    const savedUser = localStorage.getItem('smart_lunch_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.uid) {
          config.headers['x-user-uid'] = parsed.uid;
          config.headers['x-user-email'] = parsed.email || '';
          if (parsed.token) {
            config.headers['Authorization'] = `Bearer ${parsed.token}`;
          }
        }
      } catch (e) {
        // Ignore JSON parse error
      }
    }
  }
  return config;
});

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  google: (googleData) => api.post('/auth/google', googleData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, email, newPassword) => api.post('/auth/reset-password', { token, email, newPassword }),
  sendWhatsappOtp: (phone) => api.post('/auth/whatsapp/send-otp', { phone }),
  verifyWhatsappOtp: (phone, otp) => api.post('/auth/whatsapp/verify-otp', { phone, otp })
};

export const userApi = {
  getProfile: (uid) => api.get(`/user/profile${uid ? `?uid=${uid}` : ''}`),
  updateProfile: (profileData) => api.put('/user/profile', profileData)
};

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
