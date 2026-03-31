const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.codespheree.id.vn';

export const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/400x300?text=No+Image';
  if (url.startsWith('http')) return url; // Already absolute
  return `${API_BASE}/product/uploads/images/${url}`;
};

export const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}/identity/uploads/avatars/${url}`;
};
