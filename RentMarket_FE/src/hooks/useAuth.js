import { parseToken } from '../services/authService';

/**
 * Hook lấy thông tin auth cơ bản từ JWT token (không call API).
 * Trả về { username, roles, isAdmin, isLoggedIn }
 */
export const useAuth = () => {
  const tokenInfo = parseToken();

  return {
    username: tokenInfo?.username || null,
    roles: tokenInfo?.roles || [],
    isAdmin: tokenInfo?.isAdmin || false,
    isLoggedIn: !!tokenInfo,
  };
};
