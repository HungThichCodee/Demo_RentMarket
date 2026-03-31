import api from './api';

/**
 * REST API cho Chat-service.
 * Dùng để load lịch sử tin nhắn (WebSocket chỉ nhận tin real-time).
 */

export const getChatHistory = async (user1, user2) => {
  try {
    const response = await api.get(`/chat/history/${user1}/${user2}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử chat');
  }
};
