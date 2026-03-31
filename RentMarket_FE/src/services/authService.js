import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/identity/auth/token', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    // Log đầy đủ response từ Spring Boot để dễ debug
    if (error.response) {
      console.error('[LOGIN] HTTP Status:', error.response.status);
      console.error('[LOGIN] Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('[LOGIN] Response Headers:', error.response.headers);
      const serverMsg = error.response.data?.message;
      const serverCode = error.response.data?.code;
      throw new Error(
        serverMsg || `Lỗi đăng nhập (HTTP ${error.response.status}, code: ${serverCode})`
      );
    }
    if (error.request) {
      console.error('[LOGIN] No response received:', error.request);
      throw new Error('Máy chủ không phản hồi. Vui lòng kiểm tra kết nối mạng.');
    }
    console.error('[LOGIN] Request setup error:', error.message);
    throw new Error('Lỗi khi gửi yêu cầu: ' + error.message);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/identity/users', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('[REGISTER] HTTP Status:', error.response.status);
      console.error('[REGISTER] Response Data:', JSON.stringify(error.response.data, null, 2));
      const serverMsg = error.response.data?.message;
      const serverCode = error.response.data?.code;
      throw new Error(
        serverMsg || `Lỗi đăng ký (HTTP ${error.response.status}, code: ${serverCode})`
      );
    }
    if (error.request) {
      console.error('[REGISTER] No response received:', error.request);
      throw new Error('Máy chủ không phản hồi. Vui lòng kiểm tra kết nối mạng.');
    }
    console.error('[REGISTER] Request setup error:', error.message);
    throw new Error('Lỗi khi gửi yêu cầu: ' + error.message);
  }
};

// ==========================================
// USER MANAGEMENT (Identity-service)
// ==========================================

/**
 * Lấy thông tin user đang đăng nhập (từ JWT).
 * Endpoint này accessible cho mọi authenticated user, không cần ADMIN.
 */
export const getMyInfo = async () => {
  try {
    const response = await api.get('/identity/users/my-info');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
};

/**
 * Parse thông tin cơ bản từ JWT token (không cần call API).
 */
export const parseToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const scope = payload.scope || '';
    const roles = scope.split(' ').filter(Boolean);
    return {
      username: payload.sub,
      roles,
      isAdmin: roles.includes('ADMIN'),
      exp: payload.exp
    };
  } catch {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/identity/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/identity/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin người dùng');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/identity/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin');
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/identity/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể xóa người dùng');
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/identity/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể upload ảnh đại diện');
  }
};

