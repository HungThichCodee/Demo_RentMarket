import api from './api';

export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/review/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể gửi đánh giá');
  }
};

export const getMyReviews = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/review/reviews/my-reviews', { params: { page, size } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải đánh giá của bạn');
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await api.get(`/review/reviews/product/${productId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải đánh giá sản phẩm');
  }
};

export const getProductRating = async (productId) => {
  try {
    const response = await api.get(`/review/reviews/product/${productId}/rating`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải rating sản phẩm');
  }
};

export const getOwnerRating = async (ownerId) => {
  try {
    const response = await api.get(`/review/reviews/owner/${ownerId}/rating`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải rating chủ đồ');
  }
};

export const getOwnerReviews = async (ownerId, page = 0, size = 10) => {
  try {
    const response = await api.get(`/review/reviews/owner/${ownerId}`, { params: { page, size } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải đánh giá chủ đồ');
  }
};

export const getUserReviews = async (username, page = 0, size = 10) => {
  try {
    const response = await api.get(`/review/reviews/users/${username}`, { params: { page, size } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải đánh giá người dùng');
  }
};

export const getReviewsWrittenByUser = async (username, page = 0, size = 10) => {
  try {
    const response = await api.get(`/review/reviews/users/${username}/written`, { params: { page, size } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải đánh giá đã viết');
  }
};
