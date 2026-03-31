import { useState } from 'react';
import { payBookingFromWallet, getMyWallet } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * PaymentModal — Clean Light Theme.
 * Escrow: tiền frozen trong ví → giải phóng khi hoàn tất đơn.
 */
const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [walletBalance, setWalletBalance]   = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        const res = await getMyWallet();
        if (res.result) setWalletBalance(res.result.availableBalance ?? 0);
      } catch { setWalletBalance(null); }
      finally { setBalanceLoading(false); }
    };
    fetchBalance();
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const rentalFee   = booking.rentalFee   || 0;
  const depositFee  = booking.depositFee  || 0;
  const totalAmount = rentalFee + depositFee;
  const isWalletSufficient = walletBalance !== null && walletBalance >= totalAmount;

  const handlePay = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await payBookingFromWallet(booking.id);
      if (res.result) onSuccess(res.result);
    } catch (err) {
      setError(err.message || 'Thanh toán thất bại. Vui lòng kiểm tra số dư ví.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1b64f2] text-[20px]">account_balance_wallet</span>
              Thanh toán qua Ví
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Escrow — tiền giữ an toàn đến khi hoàn tất</p>
          </div>
          <button onClick={onClose} type="button" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6">
          {/* Cost breakdown */}
          <div className="mb-4 bg-slate-50 px-4 py-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Bảng chi phí — Đơn #{String(booking.id).padStart(4, '0')}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tiền thuê ({booking.rentalDays} ngày × {formatVND(booking.pricePerDay)}):</span>
                <span className="font-medium">{formatVND(rentalFee)}</span>
              </div>
              {depositFee > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tiền đặt cọc (hoàn lại khi trả đồ):</span>
                  <span className="font-medium text-amber-600">{formatVND(depositFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-semibold text-slate-900">Tổng cần thanh toán:</span>
                <span className="text-2xl font-bold text-slate-900">{formatVND(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Wallet status */}
          <div className={`mb-4 p-4 rounded-xl border flex items-center gap-3 ${
            balanceLoading ? 'border-gray-100 bg-slate-50'
            : isWalletSufficient ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
          }`}>
            <span className={`material-symbols-outlined text-[26px] ${balanceLoading ? 'text-slate-400' : isWalletSufficient ? 'text-emerald-500' : 'text-red-500'}`}>
              account_balance_wallet
            </span>
            <div className="flex-grow">
              <p className="font-semibold text-sm text-slate-700">Số dư Ví RentMarket</p>
              <p className={`text-lg font-bold ${balanceLoading ? 'text-slate-400' : isWalletSufficient ? 'text-emerald-600' : 'text-red-600'}`}>
                {balanceLoading ? 'Đang tải...' : walletBalance !== null ? formatVND(walletBalance) : 'Không thể tải'}
              </p>
              {!balanceLoading && !isWalletSufficient && walletBalance !== null && (
                <p className="text-xs text-red-600 mt-0.5">
                  Cần thêm {formatVND(totalAmount - walletBalance)} —{' '}
                  <Link to="/wallet/deposit" onClick={onClose} className="font-semibold underline">Nạp tiền ngay</Link>
                </p>
              )}
            </div>
            {!balanceLoading && isWalletSufficient && (
              <span className="material-symbols-outlined text-emerald-500 text-[22px]">check_circle</span>
            )}
          </div>

          {/* Escrow info */}
          <div className="mb-4 p-3 bg-[#1b64f2]/5 rounded-xl border border-[#1b64f2]/10">
            <p className="text-xs text-[#1b64f2] leading-relaxed">
              <span className="font-semibold">🔒 Cơ chế Escrow:</span> Số tiền sẽ bị <strong>đóng băng</strong> sau khi thanh toán và chỉ chuyển đến chủ đồ sau khi bạn xác nhận hoàn tất.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[16px]">error</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-gray-100 transition-colors cursor-pointer">
              Huỷ
            </button>
            <button
              type="submit"
              id="confirm-wallet-payment-btn"
              disabled={loading || !isWalletSufficient || balanceLoading}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white bg-[#1b64f2] hover:bg-[#1554d4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>Thanh toán {formatVND(totalAmount)}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
