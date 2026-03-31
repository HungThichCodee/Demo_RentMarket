import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerBookings, acceptBooking, rejectBooking, completeBooking, confirmHandover } from '../../services/rentalService';
import { LoadingSpinner, EmptyState, Toast, ConfirmDialog } from '../../components/common';
import { BOOKING_STATUS, BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR, BOOKING_STATUS_OPTIONS } from '../../constants/bookingStatus';
import { getImageUrl } from '../../utils/imageHelper';
import { formatDate } from '../../utils/dateHelper';
import { formatVND } from '../../utils/currency';

const INPUT_CLS = "h-10 px-3 border border-gray-200 rounded-xl bg-white text-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#1b64f2]/15 focus:border-[#1b64f2]/50 cursor-pointer transition-all";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, bookingId: null, showPrompt: false });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterProductId) params.productId = filterProductId;
      if (filterFromDate) params.fromDate = filterFromDate;
      if (filterToDate) params.toDate = filterToDate;
      const res = await getOwnerBookings(params);
      if (res.result) setRequests(res.result.content || res.result.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filterStatus, filterProductId, filterFromDate, filterToDate]);

  const handleAction = async (value) => {
    const { action, bookingId } = confirmDialog;
    try {
      if (action === 'accept') await acceptBooking(bookingId);
      else if (action === 'reject') await rejectBooking(bookingId, value);
      else if (action === 'complete') await completeBooking(bookingId);
      else if (action === 'handover') await confirmHandover(bookingId);

      setConfirmDialog({ isOpen: false, action: null, bookingId: null, showPrompt: false });
      setToast({ message: 'Thao tác thành công!', type: 'success' });
      fetchRequests();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleClearFilters = () => { setFilterStatus(''); setFilterProductId(''); setFilterFromDate(''); setFilterToDate(''); };

  const getProductImage = (booking) => {
    if (booking.productInfo?.imageUrl) return getImageUrl(booking.productInfo.imageUrl);
    return null;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Yêu cầu chờ duyệt</h1>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Trạng thái</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={INPUT_CLS}>
              {BOOKING_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Mã sản phẩm</label>
            <input
              type="number"
              value={filterProductId}
              onChange={e => setFilterProductId(e.target.value)}
              placeholder="ID..."
              className={`${INPUT_CLS} w-24`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Từ ngày</label>
            <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Đến ngày</label>
            <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className={INPUT_CLS} />
          </div>
          {(filterStatus || filterProductId || filterFromDate || filterToDate) && (
            <button
              onClick={handleClearFilters}
              className="h-10 px-3 text-sm text-slate-400 hover:text-red-500 font-medium flex items-center gap-1 cursor-pointer rounded-xl hover:bg-red-50 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
              Xoá lọc
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : requests.length === 0 ? (
        <EmptyState icon="mail" title="Chưa có yêu cầu thuê nào" description="Khi có người muốn thuê đồ của bạn, yêu cầu sẽ hiện ở đây." />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-5 items-center"
            >
              {/* Product image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                {getProductImage(booking) ? (
                  <img src={getProductImage(booking)} alt={booking.productInfo?.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="font-semibold text-base text-slate-900 truncate">
                    {booking.productInfo?.name || `Sản phẩm #${booking.productId}`}
                  </h3>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLOR[booking.status] || 'bg-slate-100 text-slate-500'}`}>
                    {BOOKING_STATUS_LABEL[booking.status] || booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                  <div><span className="font-medium text-slate-700">Người thuê:</span> {booking.tenantId}</div>
                  <div><span className="font-medium text-slate-700">Thời gian:</span> {formatDate(booking.startDate)} → {formatDate(booking.endDate)}</div>
                  {booking.note && <div className="col-span-2 italic text-slate-400 text-xs">Lời nhắn: "{booking.note}"</div>}
                </div>

                {/* Cost breakdown */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1 border border-gray-100">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tiền thuê ({booking.rentalDays} ngày × {formatVND(booking.pricePerDay)} × {booking.quantity || 1} sp):</span>
                    <span className="font-medium text-slate-700">{formatVND(booking.rentalFee)}</span>
                  </div>
                  {booking.depositFee > 0 && (
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tiền đặt cọc:</span>
                      <span className="font-medium text-slate-700">{formatVND(booking.depositFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1.5 mt-1.5">
                    <span className="text-slate-700">Tổng cộng:</span>
                    <span className="text-[#1b64f2]">{formatVND((booking.rentalFee || 0) + (booking.depositFee || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0 min-w-[140px] w-full md:w-auto">
                {booking.status === BOOKING_STATUS.PAID_WAITING_APPROVAL && (
                  <>
                    <button
                      onClick={() => setConfirmDialog({ isOpen: true, action: 'accept', bookingId: booking.id, showPrompt: false })}
                      className="text-center py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Đồng ý
                    </button>
                    <button
                      onClick={() => setConfirmDialog({ isOpen: true, action: 'reject', bookingId: booking.id, showPrompt: true })}
                      className="text-center py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      Từ chối
                    </button>
                  </>
                )}

                {booking.status === BOOKING_STATUS.APPROVED && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, action: 'handover', bookingId: booking.id, showPrompt: false })}
                    className="text-center py-2 px-4 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                    Đã giao đồ
                  </button>
                )}

                {booking.status === BOOKING_STATUS.IN_PROGRESS && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, action: 'complete', bookingId: booking.id, showPrompt: false })}
                    className="text-center py-2 px-4 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl text-sm font-medium transition-colors cursor-pointer flex flex-col items-center leading-tight"
                  >
                    <span>Đã nhận lại đồ</span>
                    <span className="text-[10px] font-normal opacity-80">(Hoàn tất đơn)</span>
                  </button>
                )}

                <Link
                  to={`/rental/bookings/${booking.id}`}
                  className="text-center py-2 px-4 bg-[#1b64f2]/8 hover:bg-[#1b64f2]/15 text-[#1b64f2] rounded-xl text-sm font-medium transition-colors"
                >
                  Xem chi tiết
                </Link>
                <Link
                  to={`/product/${booking.productId}`}
                  className="text-center py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-colors"
                >
                  Sản phẩm gốc
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, bookingId: null, showPrompt: false })}
        onConfirm={handleAction}
        title={
          confirmDialog.action === 'accept' ? 'Chấp nhận yêu cầu' :
          confirmDialog.action === 'reject' ? 'Từ chối yêu cầu' :
          confirmDialog.action === 'complete' ? 'Hoàn tất đơn thuê' : 'Đã giao đồ'
        }
        message={
          confirmDialog.action === 'accept' ? 'Chấp nhận yêu cầu thuê này?' :
          confirmDialog.action === 'reject' ? 'Vui lòng nhập lý do từ chối.' :
          confirmDialog.action === 'complete' ? 'Đánh dấu đơn này là hoàn thành?' : 'Bạn đã giao đồ cho người thuê?'
        }
        confirmText={
          confirmDialog.action === 'accept' ? 'Đồng ý' :
          confirmDialog.action === 'reject' ? 'Từ chối' :
          confirmDialog.action === 'complete' ? 'Hoàn tất' : 'Xác nhận'
        }
        confirmColor={confirmDialog.action === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
        showPrompt={confirmDialog.showPrompt}
        promptLabel="Lý do từ chối"
      />
    </div>
  );
};

export default MyRequests;
