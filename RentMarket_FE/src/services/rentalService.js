import api from './api';

// ==========================================
// WALLET API — Ví điện tử RentMarket
// ==========================================

/**
 * Lấy thông tin ví của user hiện tại.
 * Trả về: { id, userId, availableBalance, frozenBalance, totalBalance }
 */
export const getMyWallet = async () => {
  try {
    const response = await api.get('/rental/wallets/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin ví');
  }
};

/**
 * Lấy lịch sử giao dịch ví của user hiện tại.
 * Hỗ trợ phân trang: params = { page, size }
 */
export const getWalletTransactions = async (params = {}) => {
  try {
    const response = await api.get('/rental/wallets/me/transactions', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử giao dịch');
  }
};

/**
 * Khởi tạo nạp tiền qua MoMo.
 * amount: số tiền cần nạp (VNĐ, tối thiểu 10,000)
 * Trả về: { payUrl, qrCodeUrl }
 */
export const depositViaMoMo = async (amount) => {
  try {
    const response = await api.post('/rental/wallets/deposit/momo', { amount });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể khởi tạo nạp tiền MoMo');
  }
};

/**
 * Thanh toán đơn thuê từ số dư ví (Escrow flow).
 * Trừ totalAmount từ availableBalance → frozenBalance.
 * Cập nhật booking status → PAID_WAITING_APPROVAL.
 */
export const payBookingFromWallet = async (bookingId) => {
  try {
    const response = await api.post(`/rental/wallets/pay/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Thanh toán từ ví thất bại. Kiểm tra số dư khả dụng.');
  }
};

// ==========================================
// DASHBOARD API
// ==========================================

/**
 * Lấy thống kê cá nhân của Owner (dựa trên JWT).
 * Endpoint: GET /rental/dashboard/stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/rental/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải thống kê Dashboard Owner');
  }
};

/**
 * Lấy thống kê toàn sàn (chỉ Admin).
 * Endpoint: GET /rental/dashboard/admin/stats
 */
export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get('/rental/dashboard/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải thống kê Admin Dashboard');
  }
};

// ==========================================
// BOOKING API
// ==========================================

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/rental/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tạo booking');
  }
};

export const cancelBooking = async (id, reason = null) => {
  try {
    const data = reason ? { reason } : {};
    const response = await api.put(`/rental/bookings/${id}/cancel`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể huỷ booking');
  }
};

export const getMyRentals = async (params = {}) => {
  try {
    const response = await api.get('/rental/bookings/my-rentals', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử thuê');
  }
};

export const getOwnerBookings = async (params = {}) => {
  try {
    const response = await api.get('/rental/bookings/my-items', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu');
  }
};

export const acceptBooking = async (id) => {
  try {
    const response = await api.put(`/rental/bookings/${id}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể chấp nhận booking');
  }
};

export const rejectBooking = async (id, reason) => {
  try {
    const response = await api.put(`/rental/bookings/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể từ chối booking');
  }
};

export const completeBooking = async (id) => {
  try {
    const response = await api.put(`/rental/bookings/${id}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể hoàn tất booking');
  }
};

export const confirmHandover = async (id) => {
  try {
    const response = await api.put(`/rental/bookings/${id}/handover`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể xác nhận giao nhận đồ');
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/rental/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải chi tiết booking');
  }
};

export const checkAvailability = async (productId, startDate, endDate) => {
  try {
    const response = await api.get('/rental/bookings/availability', {
      params: { productId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể kiểm tra lịch trống');
  }
};


