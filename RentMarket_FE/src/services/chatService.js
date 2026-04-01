import api from './api';

/**
 * REST API cho Chat-service.
 *
 * === ENDPOINTS ===
 *
 * getChatHistory(user1, user2)
 *   GET /chat/history/{user1}/{user2}
 *   Load lịch sử đầy đủ khi mở ChatWindow.
 *
 * getMyConversations()
 *   GET /chat/conversations/me
 *   Load inbox sidebar — lấy từ bảng `conversations` (O(log N), không scan chat_messages).
 *   Server tự biết "me" từ JWT, không cần truyền username.
 *
 * markConversationAsRead(partnerUsername)
 *   PATCH /chat/conversations/{partnerUsername}/read
 *   Reset unread count về 0 khi user click vào một conversation.
 */

export const getChatHistory = async (user1, user2) => {
  try {
    const response = await api.get(`/chat/history/${user1}/${user2}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử chat');
  }
};

export const getMyConversations = async () => {
  try {
    const response = await api.get('/chat/conversations/me');
    return response.data; // ConversationSummaryDto[]
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách hội thoại');
  }
};

export const markConversationAsRead = async (partnerUsername) => {
  try {
    await api.patch(`/chat/conversations/${partnerUsername}/read`);
  } catch (error) {
    // Không throw — lỗi này không nên block UX người dùng
    console.warn('[Chat] Không thể đánh dấu đã đọc:', error?.response?.data?.message || error.message);
  }
};
