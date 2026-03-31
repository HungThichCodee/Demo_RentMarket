import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getMyWallet } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken]         = useState(localStorage.getItem('token'));
  const [balance, setBalance]     = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

  const fetchBalance = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setBalanceLoading(true);
      const res = await getMyWallet();
      if (res.result) setBalance(res.result.availableBalance ?? 0);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchBalance();
    else setBalance(null);
  }, [token, fetchBalance]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setBalance(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-[1280px] px-4 md:px-10 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1b64f2] text-white shadow-sm group-hover:bg-[#1554d4] transition-colors">
            <span className="material-symbols-outlined text-[20px]">handshake</span>
          </div>
          <span className="text-slate-900 text-lg font-bold tracking-tight group-hover:text-[#1b64f2] transition-colors">
            RentalMarket
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/dashboard',   label: 'Thống kê',         icon: 'bar_chart' },
            { to: '/my-items',    label: 'Kho đồ',           icon: 'inventory_2' },
            { to: '/my-rentals',  label: 'Đồ đang thuê',     icon: 'shopping_bag' },
            { to: '/my-requests', label: 'Yêu cầu chờ duyệt', icon: 'inbox' },
          ].map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1b64f2]/8 text-[#1b64f2]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {token ? (
            <>
              {/* Ví */}
              <Link
                to="/wallet"
                title="Ví của tôi"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">account_balance_wallet</span>
                {balanceLoading ? (
                  <span className="text-xs font-semibold text-emerald-600 animate-pulse">...</span>
                ) : balance !== null ? (
                  <span className="text-xs font-bold text-emerald-700">{formatVND(balance)}</span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">Ví</span>
                )}
              </Link>

              {/* Yêu thích */}
              <Link
                to="/my-favorites"
                title="Danh sách yêu thích"
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </Link>

              {/* Chat */}
              <Link
                to="/chat"
                title="Tin nhắn"
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </Link>

              {/* Hồ sơ */}
              <Link
                to="/profile"
                title="Hồ sơ cá nhân"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </Link>

              {/* Đăng xuất */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-medium transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-sm font-medium bg-[#1b64f2] text-white hover:bg-[#1554d4] transition-colors shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
