import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRentals, cancelBooking, confirmHandover } from '../../services/rentalService';
import { createReview } from '../../services/reviewService';
import { LoadingSpinner, EmptyState, Modal, Toast, ConfirmDialog } from '../../components/common';
import { BOOKING_STATUS, BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR, BOOKING_STATUS_OPTIONS } from '../../constants/bookingStatus';
import { getImageUrl } from '../../utils/imageHelper';
import { formatDate } from '../../utils/dateHelper';
import { formatVND } from '../../utils/currency';

// Input class tái sử dụng
const INPUT_CLS = "h-10 px-3 border border-gray-200 rounded-xl bg-white text-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#1b64f2]/15 focus:border-[#1b64f2]/50 cursor-pointer transition-all";

const MyRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, bookingId: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, bookingId: null });

  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterFromDate) params.fromDate = filterFromDate;
      if (filterToDate) params.toDate = filterToDate;
      const res = await getMyRentals(params);
      if (res.result) setRentals(res.result.content || res.result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRentals(); }, [filterStatus, filterFromDate, filterToDate]);

  const handleConfirmDialog = async () => {
    try {
      if (confirmDialog.action === 'handover') {
        await confirmHandover(confirmDialog.bookingId);
        setToast({ message: 'Đã xác nhận nhận đồ thành công!', type: 'success' });
      } else {
        await cancelBooking(confirmDialog.bookingId, 'Thay đổi kế hoạch');
        setToast({ message: 'Đã huỷ yêu cầu thuê thành công!', type: 'success' });
      }
      setConfirmDialog({ isOpen: false, action: null, bookingId: null });
      fetchRentals();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({ bookingId: reviewModal.bookingId, ...reviewForm });
      setToast({ message: 'Gửi đánh giá thành công!', type: 'success' });
      setReviewModal({ isOpen: false, bookingId: null });
      setReviewForm({ rating: 5, comment: '' });
      fetchRentals();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleClearFilters = () => { setFilterStatus(''); setFilterFromDate(''); setFilterToDate(''); };

  const getProductImage = (booking) => {
    if (booking.productInfo?.imageUrl) return getImageUrl(booking.productInfo.imageUrl);
    return null;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Lịch sử thuê đồ</h1>

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
            <label className="text-xs font-medium text-slate-500">Từ ngày</label>
            <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className={INPUT_CLS} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Đến ngày</label>
            <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className={INPUT_CLS} />
          </div>
          {(filterStatus || filterFromDate || filterToDate) && (
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
      ) : rentals.length === 0 ? (
        <EmptyState
          icon="shopping_bag"
          title="Chưa có lịch sử thuê"
          description="Bạn chưa thuê thiết bị nào. Khám phá ngay để tìm vật dụng bạn cần."
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white text-sm font-medium rounded-full transition-colors"
            >
              Xem các món đồ
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rentals.map(booking => (
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

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
                  <div><span className="font-medium text-slate-700">Từ:</span> {formatDate(booking.startDate)}</div>
                  <div><span className="font-medium text-slate-700">Đến:</span> {formatDate(booking.endDate)}</div>
                  <div><span className="font-medium text-slate-700">Chủ đồ:</span> {booking.productOwnerId}</div>
                  <div>
                    <span className="font-medium text-slate-700">Tổng:</span>{' '}
                    <span className="text-[#1b64f2] font-semibold">
                      {booking.rentalDays
                        ? formatVND((booking.rentalFee || 0) + (booking.depositFee || 0))
                        : formatVND(booking.totalPrice)}
                    </span>
                  </div>
                  {booking.note && <div className="col-span-2 italic text-slate-400 text-xs">"{booking.note}"</div>}
                  {booking.rejectionReason && (
                    <div className="col-span-2 text-red-500 text-xs">
                      <span className="font-medium">Lý do từ chối:</span> {booking.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Pending payment notice */}
                {booking.status === BOOKING_STATUS.PENDING_PAYMENT && (
                  <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">payment</span>
                    Vui lòng thanh toán để xác nhận đặt thuê.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0 min-w-[140px] w-full md:w-auto">
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

                {booking.status === BOOKING_STATUS.PENDING_PAYMENT && (
                  <button
                    onClick={() => navigate(`/rental/bookings/${booking.id}`)}
                    className="text-center py-2 px-4 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">payments</span>
                    Thanh toán ngay
                  </button>
                )}

                {booking.status === BOOKING_STATUS.PENDING_PAYMENT && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, action: 'cancel', bookingId: booking.id })}
                    className="text-center py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Huỷ yêu cầu
                  </button>
                )}

                {booking.status === BOOKING_STATUS.APPROVED && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, action: 'handover', bookingId: booking.id })}
                    className="text-center py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Đã nhận đồ
                  </button>
                )}

                {booking.status === BOOKING_STATUS.COMPLETED && (
                  <button
                    onClick={() => setReviewModal({ isOpen: true, bookingId: booking.id })}
                    className="text-center py-2 px-4 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Đánh giá
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, bookingId: null })}
        onConfirm={handleConfirmDialog}
        title={confirmDialog.action === 'handover' ? 'Xác nhận nhận đồ' : 'Huỷ yêu cầu thuê'}
        message={confirmDialog.action === 'handover' ? 'Bạn đã nhận được tài sản từ chủ đồ và tình trạng tài sản đúng như kỳ vọng chứ?' : 'Bạn có chắc chắn muốn huỷ yêu cầu thuê này không?'}
        confirmText={confirmDialog.action === 'handover' ? 'Xác nhận' : 'Huỷ yêu cầu'}
        confirmColor={confirmDialog.action === 'handover' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
      />

      {/* Review modal */}
      <Modal isOpen={reviewModal.isOpen} onClose={() => setReviewModal({ isOpen: false, bookingId: null })} title="Viết đánh giá">
        <form onSubmit={submitReview} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Đánh giá sao</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                >
                  <span className={`material-symbols-outlined text-3xl ${reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}>
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Bình luận</label>
            <textarea
              rows="4"
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1b64f2]/15 focus:border-[#1b64f2]/50 outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all"
              placeholder="Chia sẻ trải nghiệm của bạn..."
              maxLength={1000}
            />
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setReviewModal({ isOpen: false, bookingId: null })}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm border border-gray-100 transition-colors cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Gửi đánh giá
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyRentals;
