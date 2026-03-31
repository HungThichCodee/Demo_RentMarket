import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getBookingById, acceptBooking, rejectBooking,
  completeBooking, cancelBooking, confirmHandover
} from '../../services/rentalService';
import { LoadingSpinner, Toast, ConfirmDialog } from '../../components/common';
import PaymentModal from '../../components/rental/PaymentModal';
import { BOOKING_STATUS, BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from '../../constants/bookingStatus';
import { formatVND } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/dateHelper';
import { getImageUrl } from '../../utils/imageHelper';

const getUsernameFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.sub || null;
  } catch {
    return null;
  }
};

const STATUS_STEPS = [
  { key: BOOKING_STATUS.PENDING_PAYMENT,       label: 'Chờ thanh toán', icon: 'payment' },
  { key: BOOKING_STATUS.PAID_WAITING_APPROVAL, label: 'Chờ duyệt',      icon: 'hourglass_top' },
  { key: BOOKING_STATUS.APPROVED,              label: 'Đã duyệt',       icon: 'check_circle' },
  { key: BOOKING_STATUS.IN_PROGRESS,           label: 'Đang thuê',      icon: 'local_shipping' },
  { key: BOOKING_STATUS.COMPLETED,             label: 'Hoàn tất',       icon: 'task_alt' },
];

const TERMINAL_STATES = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED];

const BookingStatusStepper = ({ status }) => {
  if (TERMINAL_STATES.includes(status)) return null;
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent   = idx === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[64px]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isCurrent   ? 'bg-[#1b64f2] text-white shadow-md shadow-[#1b64f2]/25 scale-110' :
                isCompleted ? 'bg-emerald-500 text-white' :
                              'bg-slate-100 text-slate-400'
              }`}>
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
              </div>
              <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${
                isCurrent ? 'text-[#1b64f2] font-semibold' :
                isCompleted ? 'text-emerald-600' :
                              'text-slate-400'
              }`}>{step.label}</p>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 flex-shrink-0 mt-[-18px] rounded-full ${
                idx < currentIndex ? 'bg-emerald-400' : 'bg-slate-100'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <span className="material-symbols-outlined text-slate-400 mt-0.5 text-[18px]">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-medium text-slate-800 text-sm truncate">{value || '—'}</p>
    </div>
  </div>
);

const getConfirmDialogText = (action) => {
  const map = {
    accept:   { title: 'Chấp nhận yêu cầu',  message: 'Chấp nhận yêu cầu thuê này?',                         confirmText: 'Đồng ý',   confirmColor: 'bg-emerald-500 hover:bg-emerald-600' },
    reject:   { title: 'Từ chối yêu cầu',    message: 'Vui lòng nhập lý do từ chối.',                         confirmText: 'Từ chối',  confirmColor: 'bg-red-500 hover:bg-red-600' },
    complete: { title: 'Hoàn tất đơn thuê',  message: 'Đánh dấu đơn này là hoàn thành (đã nhận lại đồ)?',    confirmText: 'Hoàn tất', confirmColor: 'bg-emerald-500 hover:bg-emerald-600' },
    handover: { title: 'Xác nhận giao nhận', message: 'Xác nhận rằng tài sản đã được giao/nhận thành công?', confirmText: 'Xác nhận', confirmColor: 'bg-emerald-500 hover:bg-emerald-600' },
    cancel:   { title: 'Huỷ yêu cầu',        message: 'Huỷ yêu cầu thuê này?',                               confirmText: 'Huỷ',      confirmColor: 'bg-red-500 hover:bg-red-600' },
  };
  return map[action] || {};
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, showPrompt: false });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const currentUsername = getUsernameFromToken();

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await getBookingById(id);
      if (res.result) setBooking(res.result);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchBooking(); }, [id]);

  const handleAction = async (actionValue) => {
    const action = confirmDialog.action;
    try {
      setActionLoading(true);
      let successMsg = 'Thao tác thành công!';
      switch (action) {
        case 'accept':   await acceptBooking(id);             successMsg = 'Đã chấp nhận đơn thuê!'; break;
        case 'reject':   await rejectBooking(id, actionValue); successMsg = 'Đã từ chối đơn thuê.'; break;
        case 'complete': await completeBooking(id);           successMsg = 'Đã hoàn tất đơn thuê thành công!'; break;
        case 'cancel':   await cancelBooking(id, actionValue); successMsg = 'Đã huỷ đơn thuê.'; break;
        case 'handover': await confirmHandover(id);           successMsg = 'Đã xác nhận giao nhận thành công!'; break;
        default: return;
      }
      setConfirmDialog({ isOpen: false, action: null, showPrompt: false });
      setToast({ message: successMsg, type: 'success' });
      await fetchBooking();
    } catch (err) {
      setToast({ message: err.message || 'Lỗi khi thực hiện thao tác', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    setToast({ message: 'Thanh toán thành công! Chờ chủ đồ duyệt nhé.', type: 'success' });
    const res = await getBookingById(id);
    if (res.result) setBooking(res.result);
  };

  const openConfirm = (action, showPrompt = false) =>
    setConfirmDialog({ isOpen: true, action, showPrompt });

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Không tìm thấy booking'}</h2>
        <button onClick={() => navigate(-1)} className="text-[#1b64f2] hover:underline font-medium cursor-pointer">Quay lại</button>
      </div>
    );
  }

  const isOwner  = currentUsername === booking.productOwnerId;
  const isTenant = currentUsername === booking.tenantId;
  const productImage = booking.productInfo?.imageUrl ? getImageUrl(booking.productInfo.imageUrl) : null;
  const rentalFee   = booking.rentalFee  || 0;
  const depositFee  = booking.depositFee || 0;
  const totalAmount = rentalFee + depositFee;
  const dialogTexts = getConfirmDialogText(confirmDialog.action);

  return (
    <div className="mx-auto max-w-[960px] px-4 md:px-10 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-slate-500 hover:border-[#1b64f2] hover:text-[#1b64f2] transition-all cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900">
            Chi tiết Booking #{(booking.id || '').toString().padStart(4, '0')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Tạo lúc: {formatDateTime(booking.createdAt)}</p>
        </div>
        <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${BOOKING_STATUS_COLOR[booking.status] || 'bg-slate-100 text-slate-500'}`}>
          {BOOKING_STATUS_LABEL[booking.status] || booking.status}
        </span>
      </div>

      {/* ── Status Stepper ── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tiến trình đơn hàng</p>
        {TERMINAL_STATES.includes(booking.status) ? (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            booking.status === BOOKING_STATUS.CANCELLED
              ? 'bg-slate-50 text-slate-600 border border-slate-200'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {booking.status === BOOKING_STATUS.CANCELLED ? 'cancel' : 'block'}
            </span>
            {booking.status === BOOKING_STATUS.CANCELLED ? 'Đơn hàng đã bị huỷ.' : 'Đơn hàng đã bị từ chối.'}
          </div>
        ) : (
          <BookingStatusStepper status={booking.status} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Time & Cost */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1b64f2] text-[18px]">calendar_month</span>
              Thời gian &amp; Chi phí
            </h2>
            <div className="space-y-0 mb-4">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-sm text-slate-500">Từ ngày</span>
                <span className="font-semibold text-slate-900 text-sm">{formatDate(booking.startDate)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-sm text-slate-500">Đến ngày</span>
                <span className="font-semibold text-slate-900 text-sm">{formatDate(booking.endDate)}</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-gray-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Bảng chi phí</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Giá thuê/ngày</span>
                <span className="font-medium text-slate-700">{formatVND(booking.pricePerDay)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Số ngày thuê</span>
                <span className="font-medium text-slate-700">{booking.rentalDays} ngày</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Số lượng</span>
                <span className="font-medium text-slate-700">{booking.quantity || 1} sản phẩm</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Tiền thuê</span>
                <span className="font-semibold text-slate-800">{formatVND(rentalFee)}</span>
              </div>
              {depositFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tiền đặt cọc</span>
                  <span className="font-medium text-amber-600">{formatVND(depositFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Tổng thanh toán</span>
                <span className="font-black text-xl text-[#1b64f2]">{formatVND(totalAmount)}</span>
              </div>
              {depositFee > 0 && (
                <p className="text-[10px] text-slate-400 italic">
                  * Tiền cọc ({formatVND(depositFee)}) hoàn trả khi hoàn tất đơn.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {(booking.note || booking.rejectionReason || booking.cancellationReason) && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">chat</span>
                Lời nhắn &amp; Ghi chú
              </h2>
              {booking.note && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Lời nhắn:</p>
                  <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl text-sm border border-gray-100">"{booking.note}"</p>
                </div>
              )}
              {booking.rejectionReason && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-red-400 uppercase mb-1.5">Lý do từ chối:</p>
                  <p className="text-red-700 bg-red-50 p-3 rounded-xl text-sm border border-red-100">{booking.rejectionReason}</p>
                </div>
              )}
              {booking.cancellationReason && (
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase mb-1.5">Lý do huỷ:</p>
                  <p className="text-amber-700 bg-amber-50 p-3 rounded-xl text-sm border border-amber-100">{booking.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Product card */}
          {booking.productInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {productImage && (
                <div className="w-full aspect-[16/9] overflow-hidden bg-slate-50">
                  <img src={productImage} alt={booking.productInfo.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1b64f2] text-[18px]">inventory_2</span>
                  Món đồ được thuê
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase tracking-wider">
                  {booking.productInfo?.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base mb-1 text-slate-900">{booking.productInfo.name}</h3>
                <span className="text-xs font-medium text-[#1b64f2] bg-[#1b64f2]/8 px-2.5 py-0.5 rounded-full inline-block mb-3">
                  {booking.productInfo.categoryName}
                </span>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {booking.productInfo.description || 'Không có mô tả.'}
                </p>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-slate-500 text-sm">Giá thuê:</span>
                  <span className="font-bold text-[#1b64f2]">{formatVND(booking.productInfo.pricePerDay)} /ngày</span>
                </div>
                <Link
                  to={`/product/${booking.productId}`}
                  className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 bg-[#1b64f2]/8 hover:bg-[#1b64f2] hover:text-white text-[#1b64f2] border border-[#1b64f2]/15 hover:border-[#1b64f2] rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Xem trang sản phẩm
                </Link>
              </div>
            </div>
          )}

          {/* User info */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            {isOwner ? (
              <>
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1b64f2] text-[18px]">person</span>
                  Thông tin Người thuê
                </h2>
                <div>
                  <InfoRow icon="badge"          label="Họ và tên"     value={booking.tenantInfo?.fullName || booking.tenantInfo?.username} />
                  <InfoRow icon="account_circle" label="Username"      value={`@${booking.tenantId}`} />
                  <InfoRow icon="mail"           label="Email"         value={booking.tenantInfo?.email} />
                  <InfoRow icon="phone"          label="Điện thoại"    value={booking.tenantInfo?.phone} />
                  <InfoRow icon="location_on"    label="Địa chỉ"       value={booking.tenantInfo?.address} />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1b64f2] text-[18px]">storefront</span>
                  Thông tin Chủ đồ
                </h2>
                <div>
                  <InfoRow icon="badge"          label="Họ và tên"     value={booking.ownerInfo?.fullName || booking.ownerInfo?.username || booking.productOwnerId} />
                  <InfoRow icon="account_circle" label="Username"      value={`@${booking.productOwnerId}`} />
                  <InfoRow icon="mail"           label="Email"         value={booking.ownerInfo?.email} />
                  <InfoRow icon="phone"          label="Điện thoại"    value={booking.ownerInfo?.phone} />
                  <InfoRow icon="location_on"    label="Địa chỉ"       value={booking.ownerInfo?.address} />
                </div>
                {booking.status === BOOKING_STATUS.APPROVED && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-[#1b64f2]/5 rounded-xl border border-[#1b64f2]/10">
                    <span className="material-symbols-outlined text-[#1b64f2] text-[16px] mt-0.5 shrink-0">phone_in_talk</span>
                    <p className="text-xs text-[#1b64f2] leading-relaxed">
                      <span className="font-semibold">Đơn đã được duyệt</span> — Liên hệ chủ đồ qua số điện thoại trên để nhận đồ.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Action footer ── */}
      {!TERMINAL_STATES.includes(booking.status) && booking.status !== BOOKING_STATUS.COMPLETED && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-2.5 flex-wrap">
          {actionLoading ? (
            <span className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-100 border-t-[#1b64f2]" />
              Đang xử lý...
            </span>
          ) : (
            <>
              {isOwner && booking.status === BOOKING_STATUS.PAID_WAITING_APPROVAL && (
                <>
                  <button
                    onClick={() => openConfirm('reject', true)}
                    className="py-2.5 px-5 rounded-xl font-medium text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => openConfirm('accept')}
                    className="py-2.5 px-6 rounded-xl font-medium text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px]">check_circle</span>
                    Đồng ý cho thuê
                  </button>
                </>
              )}

              {isOwner && booking.status === BOOKING_STATUS.APPROVED && (
                <button
                  onClick={() => openConfirm('handover')}
                  className="py-2.5 px-6 rounded-xl font-medium text-sm text-white bg-[#1b64f2] hover:bg-[#1554d4] shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">local_shipping</span>
                  Đã giao đồ
                </button>
              )}

              {isOwner && booking.status === BOOKING_STATUS.IN_PROGRESS && (
                <button
                  onClick={() => openConfirm('complete')}
                  className="py-2.5 px-6 rounded-xl font-medium text-sm text-white bg-[#1b64f2] hover:bg-[#1554d4] shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">task_alt</span>
                  Đánh dấu hoàn tất
                </button>
              )}

              {isTenant && booking.status === BOOKING_STATUS.PENDING_PAYMENT && (
                <button
                  onClick={() => openConfirm('cancel')}
                  className="py-2.5 px-5 rounded-xl font-medium text-sm text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                >
                  Huỷ yêu cầu
                </button>
              )}

              {isTenant && booking.status === BOOKING_STATUS.APPROVED && (
                <button
                  onClick={() => openConfirm('handover')}
                  className="py-2.5 px-6 rounded-xl font-medium text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">inventory_2</span>
                  Xác nhận đã nhận đồ
                </button>
              )}

              {isTenant && booking.status === BOOKING_STATUS.PENDING_PAYMENT && (
                <button
                  id="open-payment-modal-btn"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="py-2.5 px-6 rounded-xl font-medium text-sm text-white bg-[#1b64f2] hover:bg-[#1554d4] shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Thanh toán — {formatVND(totalAmount)}
                </button>
              )}

              {isTenant && booking.status === BOOKING_STATUS.PAID_WAITING_APPROVAL && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">hourglass_top</span>
                  <span className="text-amber-700 font-medium text-sm">Đã thanh toán — Đang chờ chủ đồ duyệt.</span>
                </div>
              )}

              {isTenant && booking.status === BOOKING_STATUS.APPROVED && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                  <span className="text-emerald-700 font-medium text-sm">Đơn đã được duyệt — Liên hệ chủ đồ để nhận đồ.</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, showPrompt: false })}
        onConfirm={handleAction}
        title={dialogTexts.title}
        message={dialogTexts.message}
        confirmText={dialogTexts.confirmText}
        confirmColor={dialogTexts.confirmColor}
        showPrompt={confirmDialog.showPrompt}
        promptLabel="Lý do từ chối"
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={booking}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingDetail;
