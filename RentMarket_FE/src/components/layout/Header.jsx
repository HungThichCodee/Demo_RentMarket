import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getMyWallet } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';
import { useGlobalChat } from '../../context/GlobalChatContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken]         = useState(localStorage.getItem('token'));
  const [balance, setBalance]     = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
            { to: '/',        label: 'Trang chủ',   icon: 'home' },
            { to: '/about',   label: 'Giới thiệu',  icon: 'info' },
            { to: '/contact', label: 'Liên hệ',     icon: 'contact_page' }
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

              {/* Chat — với unread badge */}
              <ChatBadgeIcon />

              {/* Hồ sơ Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  title="Tài khoản của tôi"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </button>
                
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200">
                       <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                         <p className="text-sm font-semibold text-slate-900">Tài khoản của tôi</p>
                         <p className="text-xs text-slate-500 mt-0.5">Quản lý giao dịch thuận tiện</p>
                       </div>
                       
                       <div className="py-1">
                         <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <span className="material-symbols-outlined text-[18px] text-slate-400">badge</span>Hồ sơ cá nhân
                         </Link>
                         <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <span className="material-symbols-outlined text-[18px] text-slate-400">bar_chart</span>Thống kê
                         </Link>
                         <Link to="/my-items" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <span className="material-symbols-outlined text-[18px] text-slate-400">inventory_2</span>Kho đồ của tôi
                         </Link>
                         <Link to="/my-rentals" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <span className="material-symbols-outlined text-[18px] text-slate-400">shopping_bag</span>Đồ đang thuê
                         </Link>
                         <Link to="/my-requests" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm transition-colors" onClick={() => setIsProfileOpen(false)}>
                           <span className="material-symbols-outlined text-[18px] text-slate-400">inbox</span>Yêu cầu chờ duyệt
                         </Link>
                       </div>

                       <div className="border-t border-slate-100 my-1"></div>
                       <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors w-full text-left cursor-pointer">
                         <span className="material-symbols-outlined text-[18px]">logout</span>Đăng xuất
                       </button>
                    </div>
                  </>
                )}
              </div>
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

/**
 * ChatBadgeIcon — Icon chat với badge số tin chưa đọc.
 *
 * Tách thành sub-component riêng để:
 * 1. Gọi useGlobalChat() đúng chuẩn React (không trong try/catch)
 * 2. Khi context không có (chưa login) → component này không được render
 *    (Header chỉ render <ChatBadgeIcon /> khi token tồn tại)
 */
const ChatBadgeIcon = () => {
  const { unreadCount } = useGlobalChat();

  return (
    <div className="relative">
      <Link
        to="/chat"
        title="Tin nhắn"
        className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-[#1b64f2] hover:bg-[#1b64f2]/5 transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">chat</span>
      </Link>

      {/* Badge: chỉ hiện khi có tin chưa đọc */}
      {unreadCount > 0 && (
        <span
          className="
            absolute -top-0.5 -right-0.5
            min-w-[16px] h-4 rounded-full
            bg-[#1b64f2] text-white
            text-[9px] font-bold
            flex items-center justify-center px-1
            shadow-sm shadow-[#1b64f2]/30
            pointer-events-none
          "
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default Header;
