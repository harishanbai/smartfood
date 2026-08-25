const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL_PROD || 'https://smartfood-1424.onrender.com')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
let envApiUrl = API_URL.trim().replace(/\/+$/, '');
const API_BASE = envApiUrl ? (envApiUrl.endsWith('/api') ? envApiUrl.slice(0, -4) : envApiUrl) : '';

/**
 * Get a displayable image URL for a food item from MongoDB.
 * Supports:
 *   - Food object with `_id` (image served from /api/foods/:id/image)
 *   - Absolute URLs (http/https/data:)
 *   - Legacy /uploads/ paths (backward compat)
 */
export const getImageUrl = (pathOrFood) => {
  if (!pathOrFood) return '';

  // If it's a food object with _id, serve from MongoDB /api/foods/:id/image
  if (typeof pathOrFood === 'object' && pathOrFood._id) {
    return `${API_BASE}/api/foods/${pathOrFood._id}/image`;
  }

  // If it's already an absolute URL (http, https, data:), return as is
  if (typeof pathOrFood === 'string') {
    if (pathOrFood.startsWith('http') || pathOrFood.startsWith('data:')) {
      return pathOrFood;
    }
    if (pathOrFood.startsWith('/uploads/')) {
      return `${API_BASE}${pathOrFood}`;
    }
    if (pathOrFood.length === 24) {
      // 24-character ObjectId string
      return `${API_BASE}/api/foods/${pathOrFood}/image`;
    }
  }

  return '';
};

/**
 * Get image URL directly from a food document ID.
 */
export const getFoodImageUrl = (foodId) => {
  if (!foodId) return '';
  return `${API_BASE}/api/foods/${foodId}/image`;
};

export const getFallbackFoodImage = (foodOrName) => {
  return '';
};
