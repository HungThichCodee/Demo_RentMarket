import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(8);

  const resultCode = parseInt(searchParams.get('resultCode') ?? '-1', 10);
  const orderId    = searchParams.get('orderId')   ?? '';
  const transId    = searchParams.get('transId')   ?? '';
  const message    = searchParams.get('message')   ?? '';
  const amount     = searchParams.get('amount')    ?? '';
  const requestId  = searchParams.get('requestId') ?? '';
  const orderInfo  = searchParams.get('orderInfo') ?? '';
  const signature  = searchParams.get('signature') ?? '';
  const isSuccess  = resultCode === 0;
  const type       = searchParams.get('type')      ?? '';

  const bookingId = (() => {
    try {
      const parts = orderId.split('_');
      return parts.length >= 2 ? parts[1] : null;
    } catch { return null; }
  })();

  useEffect(() => {
    const verifyWithBackend = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'https://api.codespheree.id.vn'}/rental/payments/momo/verify-return`,
          { orderId, resultCode: String(resultCode), transId, signature, amount, requestId, orderInfo },
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setVerified(true);
      } catch (err) {
        console.warn('[verify-return] Backend response:', err?.response?.data);
        setVerified(true);
      }
      
      if (type === 'wallet_topup' && isSuccess) {
        navigate('/profile?tab=wallet', { state: { message: 'Nạp tiền vào ví thành công!', type: 'success' } });
      }
    };
    if (orderId) verifyWithBackend();
  }, []);

  useEffect(() => {
    if (type === 'wallet_topup' && isSuccess) return;
    if (countdown <= 0) {
      navigate(bookingId ? `/rental/bookings/${bookingId}` : '/my-rentals');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, bookingId, navigate, type, isSuccess]);

  if (type === 'wallet_topup' && isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-[#1b64f2] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-600">Đang chuyển hướng về ví...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#f8f9fa]">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
        {isSuccess ? (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-emerald-500 text-[52px]">check_circle</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-slate-500 mb-2">Giao dịch MoMo đã được xác nhận.</p>
            {transId && (
              <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-50 border border-gray-100 px-3 py-1.5 rounded-xl inline-block">
                Mã giao dịch: {transId}
              </p>
            )}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-700 font-medium">
                Trạng thái đơn thuê đã được cập nhật sang <strong>Chờ chủ đồ duyệt</strong>.
                Chủ đồ sẽ xem xét và phản hồi sớm nhất.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-[52px]">cancel</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-slate-500 mb-4">{message || 'Giao dịch không thành công. Vui lòng thử lại.'}</p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">
                Đơn thuê của bạn vẫn ở trạng thái <strong>Chờ thanh toán</strong>.
                Bạn có thể thử lại từ trang chi tiết đơn.
              </p>
            </div>
          </>
        )}

        <p className="text-sm text-slate-400 mb-6 font-medium">
          Tự động chuyển về sau <span className="font-bold text-[#1b64f2]">{countdown}s</span>...
        </p>

        <div className="flex flex-col gap-3">
          {bookingId && (
            <Link to={`/rental/bookings/${bookingId}`} className="w-full py-3.5 rounded-xl font-bold text-white bg-[#1b64f2] hover:bg-[#1554d4] transition-colors shadow-sm">
              Xem chi tiết đơn thuê
            </Link>
          )}
          <Link to="/my-rentals" className="w-full py-3.5 rounded-xl font-bold text-slate-700 bg-slate-50 border border-gray-100 hover:bg-slate-100 transition-colors">
            Danh sách đơn thuê của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;