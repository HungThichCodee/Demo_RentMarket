import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(formData.username, formData.password);
      const token = data?.result?.token;
      if (token) {
        localStorage.setItem('token', token);
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const scope = payload.scope || '';
          const isAdmin = scope.split(' ').includes('ADMIN');
          navigate(isAdmin ? '/admin' : '/');
        } catch {
          navigate('/');
        }
      } else {
        setError('Đăng nhập thất bại: Không tìm thấy token trong phản hồi.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const INPUT_CLS = "w-full h-12 pl-11 pr-4 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-4">

      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1b64f2]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1b64f2]/8 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="w-12 h-12 bg-[#1b64f2]/8 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#1b64f2] text-[26px]">lock</span>
          </div>
          <h1 className="text-slate-900 text-2xl font-bold text-center">Chào mừng trở lại</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">Nhập thông tin để truy cập tài khoản</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4">
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
              <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 pb-6">
          {/* Username */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Tên đăng nhập / Email</span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                type="text"
                placeholder="ten123@gmail.com"
                className={INPUT_CLS}
              />
            </div>
          </label>

          {/* Password */}
          <label className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
              <a href="#" className="text-[#1b64f2] hover:text-blue-700 text-xs font-medium">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">key</span>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                type="password"
                placeholder="Nhập mật khẩu"
                className={INPUT_CLS}
              />
            </div>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 bg-[#1b64f2] hover:bg-[#1554d4] active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đăng nhập...
              </span>
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider & Social Login */}
        <div className="px-8 pb-4 flex items-center justify-center gap-3">
          <div className="h-px bg-gray-100 flex-1"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hoặc</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <div className="px-8 pb-6">
          <button
            type="button"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_DOMAIN || 'https://api.codespheree.id.vn'}/identity/oauth2/authorization/google`}
            className="w-full flex items-center justify-center gap-2 h-11 border border-gray-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
            Đăng nhập với Google
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center border-t border-gray-50 pt-4">
          <p className="text-slate-500 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#1b64f2] hover:text-blue-700 font-semibold">Đăng ký</Link>
          </p>
        </div>
      </div>

      <p className="relative z-10 mt-6 text-slate-400 text-xs">
        © {new Date().getFullYear()} RentalMarket. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
