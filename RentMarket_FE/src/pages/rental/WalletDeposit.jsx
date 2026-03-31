import { useState, useEffect } from 'react';
import { getMyWallet, getWalletTransactions, depositViaMoMo } from '../../services/rentalService';
import { formatVND } from '../../utils/currency';
import { LoadingSpinner, Toast } from '../../components/common';

const TRANSACTION_TYPE_CONFIG = {
  DEPOSIT:      { label: 'Nạp tiền',            icon: 'add_circle',       color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  RENT_PAYMENT: { label: 'Thanh toán thuê',      icon: 'payments',         color: 'text-red-500',     bg: 'bg-red-50 border-red-100' },
  REFUND:       { label: 'Hoàn tiền cọc',        icon: 'currency_exchange', color: 'text-[#1b64f2]',  bg: 'bg-[#1b64f2]/5 border-[#1b64f2]/10' },
  EARNING:      { label: 'Thu nhập từ cho thuê', icon: 'attach_money',     color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  WITHDRAWAL:   { label: 'Rút tiền',             icon: 'account_balance',  color: 'text-orange-500',  bg: 'bg-orange-50 border-orange-100' },
};

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const WalletDeposit = () => {
  const [wallet, setWallet]         = useState(null);
  const [transactions, setTxns]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [toast, setToast]           = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [customAmount, setCustomAmount]   = useState('');

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getMyWallet();
      if (res.result) setWallet(res.result);
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setLoading(false); }
  };

  const fetchTransactions = async () => {
    try {
      setTxnLoading(true);
      const res = await getWalletTransactions({ size: 20 });
      if (res.result) setTxns(res.result.content || res.result.data || []);
    } catch (err) { console.error(err.message); }
    finally { setTxnLoading(false); }
  };

  useEffect(() => { fetchWallet(); fetchTransactions(); }, []);

  const handleSelectPreset = (amount) => { setDepositAmount(amount); setCustomAmount(''); };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setDepositAmount(Number(val));
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 10000) { setToast({ message: 'Số tiền nạp tối thiểu là 10,000₫', type: 'error' }); return; }
    if (amount > 50000000)          { setToast({ message: 'Số tiền nạp tối đa là 50,000,000₫', type: 'error' }); return; }
    try {
      setDepositing(true);
      const res = await depositViaMoMo(amount);
      if (res?.result?.payUrl) window.location.href = res.result.payUrl;
      else throw new Error('Không nhận được link thanh toán từ MoMo');
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setDepositing(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  const availableBalance = wallet?.availableBalance || 0;
  const frozenBalance    = wallet?.frozenBalance    || 0;

  return (
    <div className="mx-auto max-w-[960px] px-4 md:px-10 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ví RentMarket</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý số dư và nạp tiền để thanh toán đơn thuê.</p>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px]">payments</span>Số dư khả dụng
            </p>
            <h2 className="text-3xl font-bold mb-0.5">{formatVND(availableBalance)}</h2>
            <p className="text-xs text-emerald-100">Có thể dùng để thanh toán đơn thuê</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <span className="material-symbols-outlined text-[100px]">lock</span>
          </div>
          <div className="relative z-10">
            <p className="text-amber-100 text-sm flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>Đang đóng băng
            </p>
            <h2 className="text-3xl font-bold mb-0.5">{formatVND(frozenBalance)}</h2>
            <p className="text-xs text-amber-100">Tiền cọc chờ hoàn tất đơn</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Deposit Panel ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1b64f2] text-[20px]">add_circle</span>
            Nạp tiền qua MoMo
          </h2>

          {/* Preset amounts */}
          <p className="text-xs font-medium text-slate-500 mb-2.5">Chọn nhanh:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => handleSelectPreset(amount)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ${
                  depositAmount === amount
                    ? 'border-[#1b64f2] bg-[#1b64f2]/8 text-[#1b64f2]'
                    : 'border-gray-200 text-slate-600 hover:border-[#1b64f2]/40 hover:text-[#1b64f2] bg-white'
                }`}
              >
                {formatVND(amount)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Hoặc nhập số tiền khác:</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">currency_exchange</span>
              <input
                type="text"
                placeholder="Ví dụ: 300000"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b64f2]/10 focus:border-[#1b64f2]/50 outline-none text-slate-900 text-sm transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₫</span>
            </div>
            {depositAmount >= 10000 && (
              <p className="mt-1 text-xs text-[#1b64f2] font-medium">= {formatVND(Number(depositAmount))}</p>
            )}
          </div>

          {/* MoMo info */}
          <div className="mb-4 p-3 bg-[#1b64f2]/5 rounded-xl border border-[#1b64f2]/10">
            <p className="text-xs text-[#1b64f2] leading-relaxed">
              Bạn sẽ được chuyển sang trang MoMo để hoàn tất. Sau khi thành công, số dư sẽ được cập nhật tự động.
            </p>
          </div>

          <button
            onClick={handleDeposit}
            disabled={depositing || !depositAmount || Number(depositAmount) < 10000}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-[#1b64f2] hover:bg-[#1554d4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {depositing ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">payments</span>
              Nạp {depositAmount >= 10000 ? formatVND(Number(depositAmount)) : 'tiền'} qua MoMo</>
            )}
          </button>
        </div>

        {/* ── Transaction History ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1b64f2] text-[20px]">history</span>
            Lịch sử giao dịch
          </h2>

          {txnLoading ? (
            <LoadingSpinner size="sm" className="py-8" />
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-2 block">receipt_long</span>
              <p className="text-sm text-slate-400">Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {transactions.map((tx, idx) => {
                const config = TRANSACTION_TYPE_CONFIG[tx.type] || { label: tx.type, icon: 'swap_horiz', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100' };
                const isCredit = ['DEPOSIT', 'REFUND', 'EARNING'].includes(tx.type);
                return (
                  <div key={tx.id || idx} className={`flex items-center gap-3 p-3 rounded-xl border ${config.bg}`}>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-gray-100">
                      <span className={`material-symbols-outlined text-[18px] ${config.color}`}>{config.icon}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{config.label}</p>
                      <p className="text-xs text-slate-400 truncate">{tx.description || (tx.bookingId ? `Booking #${tx.bookingId}` : '')}</p>
                    </div>
                    <p className={`font-bold text-sm shrink-0 ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}{formatVND(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDeposit;
