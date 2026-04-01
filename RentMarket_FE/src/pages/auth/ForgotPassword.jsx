import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  
  // States cho step 1
  const [email, setEmail] = useState('');
  
  // States cho step 2
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Countdown (optional) cho UX
  const [countdown, setCountdown] = useState(0);

  // General States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý đếm ngược khi gửi OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/identity/auth/forgot-password', { email });
      setSuccess('Mã xác minh đã được gửi đến email của bạn.');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể yêu cầu đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length < 6) return setError('Vui lòng nhập đầy đủ mã xác minh 6 chữ số');
    if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    if (newPassword.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
    setIsLoading(true);
    try {
      await api.post('/identity/auth/reset-password', { email, otp: otpString, newPassword });
      setSuccess('Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const INPUT_CLS = "w-full h-12 pl-11 pr-4 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1b64f2]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1b64f2]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="w-12 h-12 bg-[#1b64f2]/8 rounded-2xl flex items-center justify-center mb-4 text-[#1b64f2]">
            <span className="material-symbols-outlined text-[26px]">
              {step === 3 ? 'check_circle' : 'password'}
            </span>
          </div>
          <h1 className="text-slate-900 text-2xl font-bold text-center">
            {step === 1 ? 'Khôi phục mật khẩu' : step === 2 ? 'Nhập mã xác minh' : 'Thành công'}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center px-4">
            {step === 1 && 'Vui lòng nhập định danh email của bạn để nhận mã khôi phục.'}
            {step === 2 && `Mã xác minh gồm 6 chữ số đã được gửi tới ${email}.`}
            {step === 3 && 'Tài khoản của bạn đã được bảo mật. Hãy đăng nhập với mật khẩu mới.'}
          </p>
        </div>

        {/* Notifications */}
        <div className="px-8 pb-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-2">
              <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && step !== 3 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3 mb-2">
              <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
        </div>

        {/* --- STEP 1: XÁC THỰC EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 px-8 pb-8">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Email đã đăng ký</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={INPUT_CLS}
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 mt-2 bg-[#1b64f2] text-white font-semibold rounded-xl hover:bg-[#1554d4] transition-all disabled:opacity-60 shadow-sm flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang xử lý...
                </span>
              ) : 'Nhận mã xác minh'}
            </button>
          </form>
        )}

        {/* --- STEP 2: NHẬP OTP VÀ ĐỔI MẬT KHẨU --- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5 px-8 pb-8">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 text-center">Mã xác minh (OTP)</span>
              <div className="flex justify-between gap-2">
                {otp.map((data, index) => {
                  return (
                    <input
                      className="w-12 h-14 bg-slate-50 border border-slate-200 text-slate-900 text-center text-xl font-bold rounded-xl focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 outline-none transition-all"
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                    />
                  );
                })}
              </div>
              <div className="text-center mt-1">
                {countdown > 0 ? (
                  <span className="text-xs text-slate-500">Gửi lại mã trong {countdown}s</span>
                ) : (
                  <button type="button" onClick={handleRequestOtp} className="text-[#1b64f2] text-xs font-semibold hover:underline">Gửi lại mã</button>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-1 w-full"></div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Mật khẩu mới</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">key</span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={INPUT_CLS}
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">done_all</span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={INPUT_CLS}
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading || otp.includes("")}
              className="w-full h-12 mt-2 bg-[#1b64f2] text-white font-semibold rounded-xl hover:bg-[#1554d4] transition-all disabled:opacity-60 shadow-sm flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Đang xử lý...
                </span>
              ) : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>
        )}

        {/* --- STEP 3: HOÀN THÀNH --- */}
        {step === 3 && (
          <div className="flex flex-col gap-4 px-8 pb-8">
            <Link
              to="/login"
              className="w-full h-12 mt-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Quay lại Đăng nhập
            </Link>
          </div>
        )}

        {/* Footer Quay lại SignIn */}
        {step !== 3 && (
            <div className="px-8 pb-8 text-center border-t border-gray-50 pt-5">
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại màn hình Đăng nhập
              </Link>
            </div>
        )}

      </div>
      
      <p className="relative z-10 mt-6 text-slate-400 text-xs">
        © {new Date().getFullYear()} RentalMarket. All rights reserved.
      </p>
    </div>
  );
};

export default ForgotPassword;
