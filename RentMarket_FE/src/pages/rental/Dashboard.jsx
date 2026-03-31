import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAdminDashboardStats } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';
import { useAuth } from '../../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-lg">
        <p className="font-bold text-slate-900 mb-1">{`Tháng ${label.replace('T', '')}`}</p>
        <p className="text-[#1b64f2] font-bold">{formatVND(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const OwnerDashboard = ({ stats }) => {
  const chartData = stats?.monthlyRevenue
    ? Array.from({ length: 12 }, (_, i) => ({
        name: `T${i + 1}`,
        revenue: stats.monthlyRevenue[i + 1] || 0
      }))
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard Kênh Cho Thuê</h1>
        <p className="text-slate-500 mt-1 text-sm">Thống kê hoạt động cho thuê đồ của bạn.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard gradient="from-blue-500 to-blue-700" icon="monetization_on" bgIcon="account_balance_wallet" title="Doanh thu hoàn tất (70%)" value={formatVND(stats.totalRevenue || 0)} sub={`+ ${formatVND(stats.pendingRevenue || 0)} dự kiến`} />
        <StatCard gradient="from-emerald-500 to-emerald-700" icon="analytics" bgIcon="shopping_cart_checkout" title="Tổng giao dịch" value={stats.totalBookings || 0} sub={`${stats.completedBookings || 0} đã hoàn tất`} />
        <StatCard gradient="from-amber-500 to-orange-600" icon="pending_actions" bgIcon="history_toggle_off" title="Đơn chờ duyệt" value={stats.pendingBookings || 0} sub="Chờ thanh toán / duyệt" />
        <StatCard gradient="from-purple-500 to-purple-700" icon="category" bgIcon="inventory_2" title="Kho đồ đang cho thuê" value={stats.totalItems || 0} sub={<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-yellow-300">star</span>{stats.averageRating ? stats.averageRating.toFixed(1) : 0} ({stats.totalReviews || 0} đánh giá)</span>} />
      </div>
      <DashboardCharts chartData={chartData} completedCount={stats.completedBookings || 0} activeCount={stats.activeBookings || 0} pendingCount={stats.pendingBookings || 0} totalCount={stats.totalBookings || 0} chartTitle="Doanh thu (70% của bạn) theo tháng" />
    </div>
  );
};

const AdminDashboard = ({ stats }) => {
  const chartData = stats?.monthlyPlatformRevenue
    ? Array.from({ length: 12 }, (_, i) => ({
        name: `T${i + 1}`,
        revenue: stats.monthlyPlatformRevenue[i + 1] || 0
      }))
    : [];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Admin</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard Quản Trị Sàn</h1>
          <p className="text-slate-500 mt-1 text-sm">Tổng quan hoạt động toàn hệ thống RentMarket.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard gradient="from-blue-600 to-indigo-700" icon="account_balance" bgIcon="payments" title="Phí nền tảng đã thu (30%)" value={formatVND(stats.totalPlatformRevenue || 0)} sub="Tổng phí sàn từ đơn hoàn tất" />
        <StatCard gradient="from-slate-600 to-slate-800" icon="people" bgIcon="groups" title="Tổng người dùng" value={stats.totalUsers || 0} sub="Tài khoản đã đăng ký" />
        <StatCard gradient="from-teal-500 to-teal-700" icon="receipt_long" bgIcon="summarize" title="Tổng giao dịch" value={stats.totalTransactions || 0} sub={`${stats.completedTransactions || 0} đã hoàn tất`} />
        <StatCard gradient="from-amber-500 to-orange-600" icon="hourglass_top" bgIcon="pending_actions" title="Chờ duyệt toàn sàn" value={stats.pendingApprovalCount || 0} sub={`${stats.cancelledTransactions || 0} đã huỷ/từ chối`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-[#1b64f2]">bar_chart</span> Phí nền tảng (30%) theo tháng</h3>
          </div>
          <div className="flex-grow w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${v/1000}k` : v} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f9fa' }} />
                <Bar dataKey="revenue" fill="#1b64f2" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6 pb-4 border-b border-gray-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1b64f2]">donut_large</span> Tỷ lệ giao dịch toàn sàn
          </h3>
          <div className="flex flex-col gap-5 mt-6 px-2">
            {[{ label: `Hoàn tất (${stats.completedTransactions || 0})`, count: stats.completedTransactions || 0, color: 'bg-emerald-500' }, { label: `Chờ duyệt (${stats.pendingApprovalCount || 0})`, count: stats.pendingApprovalCount || 0, color: 'bg-amber-500' }, { label: `Huỷ/Từ chối (${stats.cancelledTransactions || 0})`, count: stats.cancelledTransactions || 0, color: 'bg-red-400' }].map(item => {
              const pct = stats.totalTransactions ? Math.round((item.count / stats.totalTransactions) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-600 flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${item.color} block shadow-sm`} />{item.label}</span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ gradient, icon, bgIcon, title, value, sub }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-md relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default`}>
    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
      <span className="material-symbols-outlined text-[100px]">{bgIcon}</span>
    </div>
    <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-t-2xl" />
    <div className="relative z-10">
      <p className="font-semibold opacity-80 flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-widest text-white/90">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>{title}
      </p>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-xs opacity-80 font-medium text-white/90">{sub}</p>
    </div>
  </div>
);

const DashboardCharts = ({ chartData, completedCount, activeCount, pendingCount, totalCount, chartTitle }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-6 pb-4 border-b border-gray-50 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#1b64f2]">donut_large</span> Tỷ lệ đơn hàng
      </h3>
      <div className="flex flex-col gap-5 mt-6 px-2">
        {[{ label: `Hoàn tất (${completedCount})`, count: completedCount, color: 'bg-emerald-500' }, { label: `Đang cho thuê/Chờ (${activeCount})`, count: activeCount, color: 'bg-blue-500' }, { label: `Chờ duyệt (${pendingCount})`, count: pendingCount, color: 'bg-orange-500' }].map(item => {
          const pct = totalCount ? Math.round((item.count / totalCount) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between items-center text-sm mb-1.5 font-medium">
                <span className="text-slate-600 flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${item.color} block shadow-sm`} />{item.label}</span>
                <span className="font-bold text-slate-900">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-[#1b64f2]">bar_chart</span> {chartTitle}</h3>
      </div>
      <div className="flex-grow w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${v/1000}k` : v} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f9fa' }} />
            <Bar dataKey="revenue" fill="#1b64f2" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const fetchFn = isAdmin ? getAdminDashboardStats : getDashboardStats;
        const res = await fetchFn();
        if (res.result) setStats(res.result);
      } catch (err) { setError(err.message || 'Không thể tải thống kê'); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [isAdmin]);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" /></div>;
  if (error || !stats) return <div className="mx-auto max-w-[1280px] px-4 py-16 text-center"><h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Không tải được Dashboard'}</h2><button onClick={() => window.location.reload()} className="text-[#1b64f2] hover:underline font-medium text-sm">Bấm vào đây để thử lại</button></div>;

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8">
      {isAdmin ? <AdminDashboard stats={stats} /> : <OwnerDashboard stats={stats} />}
    </div>
  );
};

export default Dashboard;
