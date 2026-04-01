/**
 * Shared utilities cho Chat feature.
 * Tất cả helper function dùng chung giữa ChatPage, ConversationList,
 * GlobalChatToastRenderer được đặt ở đây để tránh duplicate logic.
 */

/**
 * Lấy tên hiển thị của user.
 * Ưu tiên: firstName + lastName → username.
 */
export const getDisplayName = (user) => {
  if (!user) return '';
  const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return full || user.username || '';
};

/** Chữ cái đầu cho avatar. */
export const getInitial = (user) =>
  getDisplayName(user)?.charAt(0)?.toUpperCase() || '?';

/**
 * Format timestamp thành chuỗi ngắn cho sidebar.
 * < 1 phút  → "Vừa xong"
 * < 60 phút → "X phút"
 * Cùng ngày → "HH:mm"
 * Cùng tuần → "T2"…"CN"
 * Cũ hơn    → "dd/MM"
 */
export const formatTimestamp = (ts) => {
  if (!ts) return '';
  const date = new Date(ts);
  if (isNaN(date.getTime())) return '';

  const diffMs   = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1)  return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffDays === 0)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7)
    return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Đọc username từ JWT trong localStorage.
 * Không import authService để tránh circular dependency.
 * Trả về null nếu chưa login hoặc token không hợp lệ.
 */
export const getCurrentUsername = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.sub ?? null;
  } catch {
    return null;
  }
};
