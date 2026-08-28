import axios from 'axios';
import { auth } from '../firebase';
const API_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL_PROD || 'https://smartfood-1424.onrender.com')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
const cleanBaseUrl = API_URL.trim().replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

console.log('\n🚀 [Frontend Startup]');
console.log('   Current Environment:', import.meta.env.MODE);
console.log('   Current API URL    :', API_URL);
console.log('   Resolved Base URL  :', API_BASE_URL, '\n');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.error(`❌ [Backend Not Running / Network Error] Could not connect to API server at ${API_BASE_URL}. Ensure the backend server is running on port 5001.`);
      } else {
        console.error(`❌ [Network Error] ${error.message} (Target: ${API_BASE_URL})`);
      }
    } else {
      const status = error.response.status;
      const data = error.response.data;
      if (status === 503 || data?.database === 'disconnected') {
        console.error('❌ [MongoDB Not Connected] Backend reports database is disconnected.');
      } else if (status === 403 || data?.message?.includes('CORS')) {
        console.error('❌ [CORS Blocked] Origin not allowed by backend CORS configuration.');
      } else if (status === 404) {
        console.error(`❌ [Invalid API URL / Route Not Found] ${error.config?.url} does not exist on ${API_BASE_URL}.`);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  google: (googleData) => api.post('/auth/google', googleData),
  apple: (appleData) => api.post('/auth/apple', appleData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetToken: (token, email) => {
    const payload = { token, email };
    const url = `${API_BASE_URL}/auth/verify-reset-token`;
    console.log("Verify Reset URL:", url);
    console.log("Method:", "POST");
    console.log("Payload:", payload);
    return api.post('/auth/verify-reset-token', payload);
  },
  resetPassword: (token, email, newPassword) => {
    const payload = { token, email, password: newPassword, newPassword };
    const url = `${API_BASE_URL}/auth/reset-password`;
    console.log("Reset URL:", url);
    console.log("Method:", "POST");
    console.log("Payload:", payload);
    return api.post('/auth/reset-password', payload);
  },
  getSenderEmails: () => api.get('/auth/sender-emails'),
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

export const paymentApi = {
  getPayments: () => api.get('/payments'),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  deletePayment: (id) => api.delete(`/payments/${id}`)
};

export const ingredientApi = {
  getIngredients: (params = {}) => api.get('/ingredients', { params }),
  getStorageInventory: () => api.get('/ingredients/storage'),
  addIngredient: (data) => api.post('/ingredients', data),
  updateStock: (id, data) => api.put(`/ingredients/${id}/stock`, data),
  deleteIngredient: (id) => api.delete(`/ingredients/${id}`),
  getTransactions: (params = {}) => api.get('/ingredients/transactions', { params })
};

export const recipeApi = {
  getRecipes: (params = {}) => api.get('/recipes', { params }),
  getRecipe: (idOrNumber) => api.get(`/recipes/${idOrNumber}`),
  updateRecipe: (id, data) => api.put(`/recipes/${id}`, data)
};

export const requirementApi = {
  getDailyRequirement: (date, employees = '', mealNumber = '') => {
    let url = `/requirements/daily?date=${date}`;
    if (employees !== '' && employees !== undefined) url += `&employees=${employees}`;
    if (mealNumber !== '' && mealNumber !== undefined) url += `&mealNumber=${mealNumber}`;
    return api.get(url);
  },
  saveDailyRequirement: (data) => api.post('/requirements/daily/save', data),
  confirmStockDeduction: (data) => api.post('/requirements/daily/deduct-stock', data)
};

export const holidayApi = {
  getHolidays: (month = '') => api.get(`/holidays${month ? `?month=${month}` : ''}`),
  checkHoliday: (date) => api.get(`/holidays/check?date=${date}`),
  markHoliday: (data) => api.post('/holidays', data),
  removeHoliday: (date) => api.delete(`/holidays/${date}`),
};

export default api;

