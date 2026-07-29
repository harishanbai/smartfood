const API_BASE = 'http://localhost:5001';

/**
 * Get a displayable image URL for a food item.
 * Supports:
 *   - Food object with `_id` (image served from /api/foods/:id/image)
 *   - Absolute URLs (http/https/data:)
 *   - Legacy /uploads/ paths (backward compat)
 *   - null/undefined → placeholder
 */
export const getImageUrl = (pathOrFood) => {
  if (!pathOrFood) return 'https://placehold.co/600x400/png?text=No+Image';

  // If it's a food object with _id, use the image endpoint
  if (typeof pathOrFood === 'object' && pathOrFood._id) {
    return `${API_BASE}/api/foods/${pathOrFood._id}/image`;
  }

  // If it's already an absolute URL (http, https, data:), return as is
  if (typeof pathOrFood === 'string') {
    if (pathOrFood.startsWith('http') || pathOrFood.startsWith('data:')) {
      return pathOrFood;
    }
    // Legacy /uploads/ path fallback
    return `${API_BASE}${pathOrFood}`;
  }

  return 'https://placehold.co/600x400/png?text=No+Image';
};

/**
 * Get image URL directly from a food document ID.
 */
export const getFoodImageUrl = (foodId) => {
  if (!foodId) return 'https://placehold.co/600x400/png?text=No+Image';
  return `${API_BASE}/api/foods/${foodId}/image`;
};
