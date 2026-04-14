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

import { useAdminDashboard } from '../../hooks/useDashboard';
import { formatVND } from '../../utils/currency';
import { distributePercent } from '../../utils/percentHelper';

import StatCard from '../../components/common/StatCard';
import DateRangePicker from '../../components/common/DateRangePicker';
import DashboardSkeleton from '../../components/common/DashboardSkeleton';
import DashboardErrorBoundary from '../../components/common/DashboardErrorBoundary';
import EmptyState from '../../components/common/EmptyState';

/* ─── Custom Tooltip cho Bar Chart ─── */
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-card-md">
      <p className="font-bold text-slate-900 text-sm mb-1">{`Tháng ${label?.replace('T', '')}`}</p>
      <p className="text-primary font-bold text-sm">{formatVND(payload[0].value)}</p>
    </div>
  );
};

/* ─── Custom Tooltip cho Doughnut ─── */
const DoughnutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-card-md">
      <p className="font-bold text-slate-900 text-sm">{payload[0].name}</p>
      <p className="text-sm text-slate-500">
        {payload[0].value} giao dịch ({payload[0].payload.percent}%)
      </p>
    </div>
  );
};

/* ─── Custom Legend cho Doughnut ─── */
const DoughnutLegend = ({ payload }) => (
  <div className="flex flex-col gap-3 mt-4">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-600 font-medium">{entry.value}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">
          {entry.payload.percent}%
        </span>
      </div>
    ))}
  </div>
);

/* ─── Doughnut Colors ─── */
const DOUGHNUT_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

/* ══════════════════════════════════════════════
   ADMIN OVERVIEW — Clean Light Theme
   ══════════════════════════════════════════════ */
const AdminOverview = () => {
  const [dateRange, setDateRange] = useState({ label: '30 ngày' });
  const { data, loading, error, refetch } = useAdminDashboard(dateRange);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto font-display">
        <DashboardSkeleton cardCount={3} />
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto font-display">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không thể tải Dashboard</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={refetch}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  /* ─── Empty ─── */
  if (!data) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto font-display">
        <EmptyState
          icon="dashboard"
          title="Chưa có dữ liệu"
          description="Dashboard sẽ hiển thị khi hệ thống có hoạt động."
        />
      </div>
    );
  }

  /* ─── Bar Chart data ─── */
  const barData = Array.from({ length: 12 }, (_, i) => ({
    name: `T${i + 1}`,
    revenue: data.monthlyPlatformRevenue?.[i + 1] || 0,
  }));

  /* ─── Doughnut data (đảm bảo luôn 100%) ─── */
  const rawDoughnut = [
    { name: 'Hoàn tất', count: data.completedTransactions },
    { name: 'Chờ duyệt', count: data.pendingApproval },
    { name: 'Huỷ / Từ chối', count: data.cancelledTransactions },
  ];
  const doughnutData = distributePercent(rawDoughnut);

  return (
    <DashboardErrorBoundary>
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto font-display">
        {/* ── Header + DateRangePicker ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Admin
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-0.5">
                Tổng quan hệ thống
              </h1>
              <p className="text-slate-500 text-sm">
                Dashboard quản trị nền tảng RentMarket.
              </p>
            </div>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* ── Metric Cards (3 cột) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon="storefront"
            title="Tổng GMV"
            value={formatVND(data.totalGMV)}
            sub="Tổng giá trị giao dịch"
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            icon="account_balance"
            title="Net Revenue (Phí nền tảng 30%)"
            value={formatVND(data.totalPlatformRevenue)}
            sub={`${data.totalTransactions} giao dịch`}
            growth={data.revenueGrowth}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon="group"
            title="Tổng User đăng ký"
            value={data.totalUsers}
            sub="Tài khoản trên hệ thống"
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* Bar Chart — Doanh thu */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bar_chart</span>
                Doanh thu nền tảng theo tháng
              </h3>
            </div>
            {barData.every((d) => d.revenue === 0) ? (
              <EmptyState
                icon="bar_chart"
                title="Chưa có doanh thu"
                description="Biểu đồ sẽ hiển thị khi có giao dịch hoàn tất."
              />
            ) : (
              <div className="flex-grow w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                            ? `${v / 1000}k`
                            : v
                      }
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f8f9fa' }} />
                    <Bar dataKey="revenue" fill="#1b64f2" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Doughnut Chart — Trạng thái giao dịch */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">donut_large</span>
                Trạng thái giao dịch
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Tổng: {data.totalTransactions}
              </span>
            </div>
            {data.totalTransactions === 0 ? (
              <EmptyState
                icon="donut_large"
                title="Chưa có giao dịch"
                description="Biểu đồ sẽ hiển thị khi có giao dịch."
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center min-h-[300px]">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={doughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {doughnutData.map((_, index) => (
                        <Cell key={index} fill={DOUGHNUT_COLORS[index]} />
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

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Quản lý người dùng</p>
                <p className="text-xs text-slate-500 mt-0.5">{data.totalUsers} tài khoản</p>
              </div>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-100 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">playlist_add</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Quản lý danh mục</p>
                <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa, hoặc xóa</p>
              </div>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Dashboard chi tiết</p>
                <p className="text-xs text-slate-500 mt-0.5">Xem biểu đồ doanh thu</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default AdminOverview;
