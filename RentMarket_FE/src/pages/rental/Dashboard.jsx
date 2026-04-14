import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { useAuth } from '../../hooks/useAuth';
import { useProviderDashboard, useRenterDashboard, useAdminDashboard } from '../../hooks/useDashboard';
import { formatVND } from '../../utils/currency';
import { distributePercent } from '../../utils/percentHelper';

import StatCard from '../../components/common/StatCard';
import DashboardSkeleton from '../../components/common/DashboardSkeleton';
import DashboardErrorBoundary from '../../components/common/DashboardErrorBoundary';
import EmptyState from '../../components/common/EmptyState';
import DateRangePicker from '../../components/common/DateRangePicker';

/* ═══════════ SHARED CHART COMPONENTS ═══════════ */

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-card-md">
      <p className="font-bold text-slate-900 text-sm mb-1">{`Tháng ${label?.replace('T', '')}`}</p>
      <p className="text-primary font-bold text-sm">{formatVND(payload[0].value)}</p>
    </div>
  );
};

const DoughnutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-card-md">
      <p className="font-bold text-slate-900 text-sm">{payload[0].name}</p>
      <p className="text-sm text-slate-500">
        {payload[0].value} đơn ({payload[0].payload.percent}%)
      </p>
    </div>
  );
};

const DoughnutLegend = ({ payload }) => (
  <div className="flex flex-col gap-3 mt-4">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-slate-600 font-medium">{entry.value}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">{entry.payload.percent}%</span>
      </div>
    ))}
  </div>
);

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

/* ═══════════════════════════════════════════════
   PROVIDER DASHBOARD — Chủ đồ (Owner)
   ═══════════════════════════════════════════════ */
const ProviderDashboard = () => {
  const { data, loading, error, refetch } = useProviderDashboard();

  if (loading) return <DashboardSkeleton cardCount={4} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Lỗi tải dữ liệu</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={refetch} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState icon="inventory_2" title="Chưa có hoạt động" description="Hãy đăng món đồ đầu tiên để bắt đầu cho thuê." action={{ label: 'Đăng món đồ', onClick: () => (window.location.href = '/my-items') }} />
    );
  }

  /* Bar chart data */
  const barData = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    revenue: data.monthlyRevenue?.[i + 1] || 0,
  }));

  /* Doughnut data (luôn cộng đúng 100%) */
  const rawDoughnut = [
    { name: 'Hoàn tất', count: data.completedBookings },
    { name: 'Đang thuê', count: data.activeBookings },
    { name: 'Chờ duyệt', count: data.pendingBookings },
  ];
  const doughnutData = distributePercent(rawDoughnut);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard Kênh Cho Thuê</h1>
        <p className="text-slate-500 mt-1 text-sm">Thống kê hoạt động cho thuê đồ của bạn.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon="monetization_on"
          title="Doanh thu (70%)"
          value={formatVND(data.totalRevenue)}
          sub={`+ ${formatVND(data.pendingRevenue)} dự kiến`}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          icon="inventory_2"
          title="Tỷ lệ lấp đầy kho"
          value={`${data.fillRate}%`}
          sub={`${data.rentedItems}/${data.totalItems} đang cho thuê`}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          icon="pending_actions"
          title="Yêu cầu chờ duyệt"
          value={data.pendingBookings}
          sub="Chờ thanh toán / duyệt"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          icon="star"
          title="Đánh giá trung bình"
          value={data.averageRating ? data.averageRating.toFixed(1) : '0'}
          sub={`${data.totalReviews} đánh giá`}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Doughnut */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">donut_large</span>
              Tỷ lệ đơn hàng
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Tổng: {data.totalBookings}
            </span>
          </div>
          {data.totalBookings === 0 ? (
            <EmptyState icon="donut_large" title="Chưa có đơn hàng" description="Tỷ lệ sẽ hiển thị khi có đơn thuê." />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={doughnutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="name" strokeWidth={0}>
                    {doughnutData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DoughnutTooltip />} />
                  <Legend content={<DoughnutLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Doanh thu (70% của bạn) theo tháng
            </h3>
          </div>
          {barData.every((d) => d.revenue === 0) ? (
            <EmptyState icon="bar_chart" title="Chưa có doanh thu" description="Biểu đồ hiển thị khi có giao dịch hoàn tất." />
          ) : (
            <div className="flex-grow w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f9fa' }} />
                  <Bar dataKey="revenue" fill="#1b64f2" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════
   RENTER DASHBOARD — Người thuê
   ═══════════════════════════════════════════════ */
const RenterDashboard = () => {
  const { data, loading, error, refetch } = useRenterDashboard();

  if (loading) return <DashboardSkeleton cardCount={3} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Lỗi tải dữ liệu</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={refetch} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState icon="shopping_bag" title="Chưa có đơn thuê" description="Bạn chưa thuê món đồ nào. Hãy khám phá ngay!" action={{ label: 'Khám phá sản phẩm', onClick: () => (window.location.href = '/') }} />
    );
  }

  const formatReturnDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const formatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (diffDays < 0) return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, formatted, urgent: true };
    if (diffDays === 0) return { text: 'Hôm nay', formatted, urgent: true };
    if (diffDays <= 3) return { text: `Còn ${diffDays} ngày`, formatted, urgent: true };
    return { text: `Còn ${diffDays} ngày`, formatted, urgent: false };
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Tổng quan thuê đồ</h1>
        <p className="text-slate-500 mt-1 text-sm">Theo dõi các món đang thuê và lịch trả đồ.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon="shopping_bag"
          title="Đang thuê"
          value={data.activeCount}
          sub={`${data.totalRentals} đơn tổng cộng`}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          icon="payments"
          title="Tổng chi tiêu"
          value={formatVND(data.totalSpent)}
          sub={`${data.completedCount} đơn hoàn tất`}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          icon="check_circle"
          title="Đã hoàn tất"
          value={data.completedCount}
          sub="Đơn thuê đã trả"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Timeline trả đồ */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Timeline trả đồ
          </h3>
          <Link to="/my-rentals" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            Xem tất cả
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {data.returnTimeline.length === 0 ? (
          <EmptyState
            icon="event_available"
            title="Không có lịch trả đồ"
            description="Bạn không có món nào đang thuê cần trả."
          />
        ) : (
          <div className="space-y-3">
            {data.returnTimeline.slice(0, 5).map((item) => {
              const info = formatReturnDate(item.endDate);
              return (
                <Link
                  key={item.id}
                  to={`/rental/bookings/${item.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.urgent ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-primary'}`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {info.urgent ? 'warning' : 'event'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Hạn trả: {info.formatted}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${info.urgent ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {info.text}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {formatVND(item.totalAmount)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD (trong route /dashboard)
   Khi Admin xem /dashboard thay vì /admin
   ═══════════════════════════════════════════════ */
const AdminDashboardView = () => {
  const [dateRange, setDateRange] = useState({ label: '30 ngày' });
  const { data, loading, error, refetch } = useAdminDashboard(dateRange);

  if (loading) return <DashboardSkeleton cardCount={4} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không thể tải Dashboard</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={refetch} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return <EmptyState icon="dashboard" title="Chưa có dữ liệu" />;

  const barData = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    revenue: data.monthlyPlatformRevenue?.[i + 1] || 0,
  }));

  const rawDoughnut = [
    { name: 'Hoàn tất', count: data.completedTransactions },
    { name: 'Chờ duyệt', count: data.pendingApproval },
    { name: 'Huỷ / Từ chối', count: data.cancelledTransactions },
  ];
  const doughnutData = distributePercent(rawDoughnut);

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Admin</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard Quản Trị Sàn</h1>
            <p className="text-slate-500 mt-1 text-sm">Tổng quan hoạt động toàn hệ thống RentMarket.</p>
          </div>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="storefront" title="Tổng GMV" value={formatVND(data.totalGMV)} sub="Tổng giá trị giao dịch" iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard icon="account_balance" title="Net Revenue (30%)" value={formatVND(data.totalPlatformRevenue)} sub={`${data.totalTransactions} giao dịch`} growth={data.revenueGrowth} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon="group" title="Tổng User" value={data.totalUsers} sub="Tài khoản đăng ký" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard icon="hourglass_top" title="Chờ duyệt" value={data.pendingApproval} sub={`${data.cancelledTransactions} đã huỷ`} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Phí nền tảng (30%) theo tháng
            </h3>
          </div>
          {barData.every((d) => d.revenue === 0) ? (
            <EmptyState icon="bar_chart" title="Chưa có doanh thu" />
          ) : (
            <div className="flex-grow w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f9fa' }} />
                  <Bar dataKey="revenue" fill="#1b64f2" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Doughnut */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">donut_large</span>
              Tỷ lệ giao dịch toàn sàn
            </h3>
            <span className="text-xs text-slate-400 font-medium">Tổng: {data.totalTransactions}</span>
          </div>
          {data.totalTransactions === 0 ? (
            <EmptyState icon="donut_large" title="Chưa có giao dịch" />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={doughnutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="name" strokeWidth={0}>
                    {doughnutData.map((_, idx) => (
                      <Cell key={idx} fill={['#10b981', '#f59e0b', '#ef4444'][idx]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DoughnutTooltip />} />
                  <Legend content={<DoughnutLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD ROUTER
   ═══════════════════════════════════════════════ */


const Dashboard = () => {
  const { isAdmin } = useAuth();

  /* Nếu là User thường: kiểm tra có phải Provider hay Renter
     Logic: nếu user có items (là chủ đồ) → ProviderDashboard
            ngược lại → RenterDashboard
     Admin luôn thấy AdminDashboardView */
  const [activeTab, setActiveTab] = useState('provider');

  if (isAdmin) {
    return (
      <DashboardErrorBoundary>
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-8 font-display">
          <AdminDashboardView />
        </div>
      </DashboardErrorBoundary>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-8 font-display">
        {/* Tab Switch cho User */}
        <div className="mb-6 flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'provider'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Chủ đồ
            </span>
          </button>
          <button
            onClick={() => setActiveTab('renter')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'renter'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              Người thuê
            </span>
          </button>
        </div>

        {activeTab === 'provider' ? <ProviderDashboard /> : <RenterDashboard />}
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
