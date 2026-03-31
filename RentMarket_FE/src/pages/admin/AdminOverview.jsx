import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../services/authService';
import { getAllCategories } from '../../services/productService';
import { getAdminDashboardStats } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    totalPlatformRevenue: 0,
    totalTransactions: 0,
    pendingApprovalCount: 0,
    completedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, catsRes, dashRes] = await Promise.allSettled([
          getAllUsers(),
          getAllCategories(),
          getAdminDashboardStats(),
        ]);

        const userCount = usersRes.status === 'fulfilled' && usersRes.value.result
          ? (Array.isArray(usersRes.value.result) ? usersRes.value.result.length : (usersRes.value.result.totalElements || 0))
          : 0;
        const catCount = catsRes.status === 'fulfilled' && catsRes.value.result
          ? catsRes.value.result.length
          : 0;
        const dash = dashRes.status === 'fulfilled' && dashRes.value.result
          ? dashRes.value.result
          : {};

        setStats({
          users: dash.totalUsers || userCount,
          categories: catCount,
          totalPlatformRevenue: dash.totalPlatformRevenue || 0,
          totalTransactions: dash.totalTransactions || 0,
          pendingApprovalCount: dash.pendingApprovalCount || 0,
          completedTransactions: dash.completedTransactions || 0,
        });
      } catch (err) {
        console.error('AdminOverview load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metricCards = [
    {
      title: 'Phí nền tảng đã thu (30%)',
      value: formatVND(stats.totalPlatformRevenue),
      icon: 'account_balance',
      color: 'bg-indigo-50 text-indigo-600',
      iconBox: 'bg-indigo-500 text-white',
      link: '/dashboard',
      sub: 'Tổng doanh thu sàn',
    },
    {
      title: 'Người dùng',
      value: stats.users,
      icon: 'group',
      color: 'bg-emerald-50 text-emerald-600',
      iconBox: 'bg-emerald-500 text-white',
      link: '/admin/users',
      sub: 'Tài khoản đăng ký',
    },
    {
      title: 'Giao dịch',
      value: stats.totalTransactions,
      icon: 'receipt_long',
      color: 'bg-purple-50 text-purple-600',
      iconBox: 'bg-purple-500 text-white',
      link: '/dashboard',
      sub: `${stats.completedTransactions} hoàn tất`,
    },
    {
      title: 'Chờ duyệt',
      value: stats.pendingApprovalCount,
      icon: 'pending_actions',
      color: 'bg-amber-50 text-amber-600',
      iconBox: 'bg-amber-500 text-white',
      link: '/dashboard',
      sub: 'PAID_WAITING_APPROVAL',
    },
    {
      title: 'Danh mục',
      value: stats.categories,
      icon: 'category',
      color: 'bg-teal-50 text-teal-600',
      iconBox: 'bg-teal-500 text-white',
      link: '/admin/categories',
      sub: 'Danh mục hệ thống',
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
          Admin
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Tổng quan hệ thống</h1>
          <p className="text-slate-500 text-sm">Chào mừng trở lại! Tổng quan nền tảng RentMarket.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" />
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {metricCards.map(card => (
              <Link
                key={card.title}
                to={card.link}
                className="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group block"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wider">{card.title}</p>
                    <p className="text-3xl font-black text-slate-900 mb-1">{card.value}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{card.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.iconBox} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                    <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-[#1b64f2] text-xs font-semibold group-hover:text-blue-700 transition-colors">
                  Xem chi tiết
                  <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/users" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Quản lý người dùng</p>
                  <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa, hoặc xóa</p>
                </div>
              </Link>
              <Link to="/admin/categories" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">playlist_add</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Quản lý danh mục</p>
                  <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa, hoặc xóa</p>
                </div>
              </Link>
              <Link to="/dashboard" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-gray-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Dashboard</p>
                  <p className="text-xs text-slate-500 mt-0.5">Xem biểu đồ doanh thu</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;
