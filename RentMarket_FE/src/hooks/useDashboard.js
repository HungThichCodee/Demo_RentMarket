import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getAdminDashboardStats, getMyRentals } from '../services/rentalService';
import { getAllUsers } from '../services/authService';
import { getMyItems as fetchMyItems } from '../services/productService';

/* ─────────── Admin Dashboard Hook ─────────── */
export const useAdminDashboard = (dateRange = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, usersRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getAllUsers(),
      ]);

      const dash =
        dashRes.status === 'fulfilled' && dashRes.value?.result
          ? dashRes.value.result
          : {};
      const userList =
        usersRes.status === 'fulfilled' && usersRes.value?.result
          ? usersRes.value.result
          : [];
      const userCount = Array.isArray(userList)
        ? userList.length
        : userList.totalElements || 0;

      /* ── Làm sạch dữ liệu, tránh mâu thuẫn ── */
      const totalUsers = dash.totalUsers || userCount;
      const totalTransactions = dash.totalTransactions || 0;
      const completedTransactions = dash.completedTransactions || 0;
      const pendingApproval = dash.pendingApprovalCount || 0;
      const cancelledTransactions = dash.cancelledTransactions || 0;
      const totalPlatformRevenue = dash.totalPlatformRevenue || 0;
      const totalGMV = dash.totalGMV || Math.round(totalPlatformRevenue / 0.3) || 0;

      /* Revenue & User = 0 → GMV phải = 0 */
      const sanitizedGMV =
        totalTransactions === 0 && totalUsers === 0 ? 0 : totalGMV;
      const sanitizedPlatformRevenue =
        totalTransactions === 0 ? 0 : totalPlatformRevenue;

      /* Monthly revenue */
      const monthlyPlatformRevenue = dash.monthlyPlatformRevenue || {};

      /* Tính tăng/giảm % (giả lập so tháng trước) */
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const curRev = monthlyPlatformRevenue[currentMonth] || 0;
      const prevRev = monthlyPlatformRevenue[prevMonth] || 0;
      const revenueGrowth =
        prevRev > 0 ? ((curRev - prevRev) / prevRev) * 100 : curRev > 0 ? 100 : 0;

      setData({
        totalGMV: sanitizedGMV,
        totalPlatformRevenue: sanitizedPlatformRevenue,
        totalUsers,
        totalTransactions,
        completedTransactions,
        pendingApproval,
        cancelledTransactions,
        monthlyPlatformRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê Admin Dashboard');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/* ─────────── Provider (Chủ đồ) Dashboard Hook ─────────── */
export const useProviderDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      const stats = res?.result || {};

      const totalItems = stats.totalItems || 0;
      const rentedItems = stats.activeBookings || 0;
      const fillRate = totalItems > 0 ? Math.round((rentedItems / totalItems) * 100) : 0;

      setData({
        totalRevenue: stats.totalRevenue || 0,
        pendingRevenue: stats.pendingRevenue || 0,
        totalBookings: stats.totalBookings || 0,
        completedBookings: stats.completedBookings || 0,
        activeBookings: stats.activeBookings || 0,
        pendingBookings: stats.pendingBookings || 0,
        totalItems,
        rentedItems,
        fillRate,
        averageRating: stats.averageRating || 0,
        totalReviews: stats.totalReviews || 0,
        monthlyRevenue: stats.monthlyRevenue || {},
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê Provider Dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/* ─────────── Renter (Người thuê) Dashboard Hook ─────────── */
export const useRenterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyRentals({ page: 0, size: 1000 });
      const rentals = res?.result?.content || res?.result || [];
      const list = Array.isArray(rentals) ? rentals : [];

      /* Trạng thái "đang hoạt động" từ góc nhìn người thuê:
         PENDING_PAYMENT, PAID_WAITING_APPROVAL, APPROVED, IN_PROGRESS */
      const ACTIVE_STATUSES = [
        'PENDING_PAYMENT',
        'PAID_WAITING_APPROVAL',
        'APPROVED',
        'IN_PROGRESS',
      ];
      const activeRentals = list.filter((b) => ACTIVE_STATUSES.includes(b.status));
      const completedRentals = list.filter((b) => b.status === 'COMPLETED');

      /* Tổng chi tiêu = rentalFee + depositFee (field thực tế từ BookingResponse) */
      const totalSpent = completedRentals.reduce(
        (sum, b) => sum + (b.rentalFee || 0) + (b.depositFee || 0),
        0
      );

      /* Timeline trả đồ: các đơn đã duyệt hoặc đang thuê, sắp hết hạn */
      const inProgressRentals = list.filter(
        (b) => b.status === 'IN_PROGRESS' || b.status === 'APPROVED'
      );
      const returnTimeline = inProgressRentals
        .filter((b) => b.endDate)
        .map((b) => ({
          id: b.id,
          itemName: b.productInfo?.name || `Sản phẩm #${b.productId}`,
          endDate: b.endDate,
          status: b.status,
          totalAmount: (b.rentalFee || 0) + (b.depositFee || 0),
        }))
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

      setData({
        activeCount: activeRentals.length,
        completedCount: completedRentals.length,
        totalRentals: list.length,
        totalSpent,
        returnTimeline,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thống kê Renter Dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
