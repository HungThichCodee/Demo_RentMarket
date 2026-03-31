import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { parseToken } from '../../services/authService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const tokenInfo = parseToken();

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const navItems = [
    { path: '/admin',            label: 'Tổng quan',   icon: 'dashboard',  end: true },
    { path: '/admin/users',      label: 'Người dùng',  icon: 'group' },
    { path: '/admin/categories', label: 'Danh mục',    icon: 'category' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 sticky top-0 h-screen shadow-sm">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1b64f2] text-white">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">RentalMarket</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bảng quản trị</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1b64f2]/8 text-[#1b64f2] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">storefront</span>
            Về trang chủ
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1b64f2] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {tokenInfo?.username?.substring(0, 1).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{tokenInfo?.username || 'Admin'}</p>
              <p className="text-[10px] text-slate-400">Quản trị viên</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors" title="Đăng xuất">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
