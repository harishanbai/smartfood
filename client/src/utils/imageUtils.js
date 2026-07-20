export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x400/png?text=No+Image'; // default placeholder
  
  // If it's already an absolute URL (http, https, data:), return as is
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Prepend backend URL for relative paths
  return `http://localhost:5001${path}`;
};
