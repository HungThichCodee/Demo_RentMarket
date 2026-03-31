import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await register({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      setSuccess('Tạo tài khoản thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const INPUT_CLS = "w-full h-12 px-4 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";
  const INPUT_ICON_CLS = "w-full h-12 pl-4 pr-10 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col">

      {/* Mini header */}
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1b64f2] text-white">
            <span className="material-symbols-outlined text-[18px]">handshake</span>
          </div>
          <span className="text-slate-900 font-bold text-base group-hover:text-[#1b64f2] transition-colors">RentalMarket</span>
        </Link>
        <Link to="/login" className="px-4 py-2 bg-[#1b64f2] hover:bg-[#1554d4] text-white text-sm font-medium rounded-full transition-colors">
          Đăng nhập
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-[480px]">

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="text-center mb-6">
              <h1 className="text-slate-900 text-2xl font-bold">Tạo tài khoản</h1>
              <p className="text-slate-500 text-sm mt-1.5">Đăng ký để tham gia cộng đồng cho thuê</p>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                </div>
                <p className="text-slate-900 font-semibold">{success}</p>
                <p className="text-slate-400 text-sm mt-1">Đang chuyển hướng đến trang đăng nhập...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                    <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}

                {/* Tên + Họ */}
                <div className="flex gap-3">
                  <label className="flex flex-col gap-1.5 flex-1">
                    <span className="text-sm font-medium text-slate-700">Tên</span>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" placeholder="Tên" className={INPUT_CLS} />
                  </label>
                  <label className="flex flex-col gap-1.5 flex-1">
                    <span className="text-sm font-medium text-slate-700">Họ</span>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" placeholder="Họ" className={INPUT_CLS} />
                  </label>
                </div>

                {/* Username */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Tên đăng nhập</span>
                  <div className="relative">
                    <input name="username" value={formData.username} onChange={handleChange} required type="text" minLength={3} maxLength={20} placeholder="3–20 ký tự" className={INPUT_ICON_CLS} />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">person</span>
                  </div>
                </label>

                {/* Email */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <div className="relative">
                    <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="name@company.com" className={INPUT_ICON_CLS} />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">mail</span>
                  </div>
                </label>

                {/* Password */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
                  <input name="password" value={formData.password} onChange={handleChange} required type="password" placeholder="Tạo mật khẩu mới" className={INPUT_CLS} />
                </label>

                {/* Confirm Password */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</span>
                  <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required type="password" placeholder="Nhập lại mật khẩu" className={INPUT_CLS} />
                </label>

                {/* Terms */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input id="terms" required type="checkbox" className="w-4 h-4 mt-0.5 border border-gray-300 rounded bg-slate-50 accent-[#1b64f2] cursor-pointer" />
                  <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                    Tôi đồng ý với{' '}
                    <a href="#" className="text-[#1b64f2] hover:underline font-medium">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="#" className="text-[#1b64f2] hover:underline font-medium">Chính sách bảo mật</a>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-1 bg-[#1b64f2] hover:bg-[#1554d4] active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo tài khoản...
                    </span>
                  ) : 'Tạo tài khoản'}
                </button>

                <p className="text-center text-slate-500 text-sm">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-[#1b64f2] font-semibold hover:text-blue-700">Đăng nhập</Link>
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © {new Date().getFullYear()} RentalMarket Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
