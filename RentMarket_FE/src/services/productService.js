import api from './api';

// ==========================================
// ITEM ENDPOINTS
// ==========================================

export const getItems = async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', criteria = {}) => {
  try {
    const params = { page, size, sortBy, sortDir, ...criteria };
    const response = await api.get('/product/items', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch items');
  }
};

export const getMyItems = async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    const params = { page, size, sortBy, sortDir };
    const response = await api.get('/product/items/my-items', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your items');
  }
};

export const getItemById = async (id) => {
  try {
    const response = await api.get(`/product/items/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch item details');
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await api.post('/product/items', itemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create item');
  }
};

export const updateItem = async (id, itemData) => {
  try {
    const response = await api.put(`/product/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update item');
  }
};

export const deleteItem = async (id) => {
  try {
    const response = await api.delete(`/product/items/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete item');
  }
};

export const rentItem = async (id) => {
  try {
    const response = await api.post(`/product/items/${id}/rent`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to rent item');
  }
};

export const uploadItemImage = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/product/items/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// ==========================================
// CATEGORY ENDPOINTS
// ==========================================

export const getAllCategories = async () => {
  try {
    const response = await api.get('/product/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const getCategoryTree = async () => {
  try {
    const response = await api.get('/product/categories/tree');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch category tree');
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/product/categories', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/product/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/product/categories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};

// ==========================================
// FAVORITES API
// ==========================================

export const addFavorite = async (itemId) => {
  try {
    const response = await api.post(`/product/favorites/${itemId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add favorite');
  }
};

export const removeFavorite = async (itemId) => {
  try {
    const response = await api.delete(`/product/favorites/${itemId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove favorite');
  }
};

export const getMyFavorites = async (page = 0, size = 20) => {
  try {
    const response = await api.get(`/product/favorites?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load favorites');
  }
};
