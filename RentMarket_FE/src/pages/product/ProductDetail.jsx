import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemById, addFavorite, removeFavorite } from '../../services/productService';
import { createBooking, checkAvailability } from '../../services/rentalService';
import { getProductReviews, getOwnerRating } from '../../services/reviewService';
import { getMyInfo } from '../../services/authService';
import { getImageUrl } from '../../utils/imageHelper';
import { formatVND } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelper';
import { Toast } from '../../components/common';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ownerRating, setOwnerRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);

  const isProfileComplete = userProfile?.phone && userProfile?.address;

  const fetchAvailability = useCallback(async () => {
    if (!startDate || !endDate || !item?.id) return;
    if (new Date(startDate) >= new Date(endDate)) return;
    try {
      setAvailLoading(true);
      const res = await checkAvailability(item.id, startDate, endDate);
      setAvailability(res.result);
    } catch { } // Error silently
    finally { setAvailLoading(false); }
  }, [startDate, endDate, item?.id]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return setToast({ message: 'Vui lòng chọn ngày', type: 'warning' });
    if (new Date(startDate) >= new Date(endDate)) return setToast({ message: 'Ngày kết thúc phải sau ngày bắt đầu', type: 'warning' });
    if (!isProfileComplete) return setToast({ message: 'Bạn cần cập nhật số điện thoại và địa chỉ trong profile trước khi thuê đồ', type: 'warning' });

    try {
      setBookingLoading(true);
      await createBooking({ productId: item.id, startDate, endDate, quantity, note });
      setToast({ message: 'Đã gửi yêu cầu thuê thành công!', type: 'success' });
      setTimeout(() => navigate('/my-rentals'), 1500);
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setBookingLoading(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemRes, userRes] = await Promise.allSettled([getItemById(id), getMyInfo()]);
        if (itemRes.status === 'fulfilled' && itemRes.value.result) {
          const itemData = itemRes.value.result;
          setItem(itemData);
          Promise.all([
            getProductReviews(id).then(r => setReviews(r.result?.content || r.result?.data || [])),
            itemData.ownerId ? getOwnerRating(itemData.ownerId).then(r => setOwnerRating(r.result)) : null
          ]).catch(() => {});
        }
        if (userRes.status === 'fulfilled' && userRes.value.result) setUserProfile(userRes.value.result);
      } catch (err) { setError(err.message || 'Lỗi khi tải thông tin sản phẩm'); }
      finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" /></div>;
  if (error || !item) return <div className="mx-auto max-w-[1280px] px-4 py-16 text-center"><h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Không tìm thấy sản phẩm'}</h2><Link to="/" className="text-[#1b64f2] hover:underline text-sm font-medium">Quay về Trang chủ</Link></div>;

  const handleToggleFavorite = async () => {
    try {
      if (item.isFavoritedByMe) {
        await removeFavorite(item.id);
        setItem({ ...item, isFavoritedByMe: false });
        setToast({ message: "Đã bỏ yêu thích", type: "info" });
      } else {
        await addFavorite(item.id);
        setItem({ ...item, isFavoritedByMe: true });
        setToast({ message: "Đã thêm vào danh sách yêu thích", type: "success" });
      }
    } catch (error) { setToast({ message: error.message || 'Vui lòng đăng nhập để thực hiện', type: "error" }); }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8 bg-[#f8f9fa] min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium">
        <Link to="/" className="hover:text-[#1b64f2] transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-[#1b64f2] cursor-default transition-colors">{item.category?.name || 'Danh mục'}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-semibold text-slate-700 truncate max-w-[200px]">{item.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFTSIDE */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm relative">
            {item.images && item.images.length > 0 ? (
              <img src={getImageUrl(item.images[selectedImageIndex]?.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-6xl">image_not_supported</span>
              </div>
            )}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-800 shadow-sm border border-gray-100">
                {item.status}
              </span>
            </div>
          </div>
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.images.map((img, idx) => (
                <div key={idx} onClick={() => setSelectedImageIndex(idx)} className={`w-24 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${selectedImageIndex === idx ? 'border-[#1b64f2] shadow-sm' : 'border-transparent hover:border-[#1b64f2]/30 bg-white'}`}>
                  <img src={getImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">Mô tả sản phẩm</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{item.description || 'Chưa có mô tả.'}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-5">Thông tin Chủ đồ</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-[#1b64f2]/10 flex items-center justify-center font-bold text-lg text-[#1b64f2] uppercase shadow-sm shrink-0">
                {(item.owner?.name || item.ownerId || 'U').substring(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{item.owner?.name || item.ownerId || 'Người dùng ẩn danh'}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  {ownerRating && ownerRating.totalReviews > 0 ? (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg flex items-center gap-1 font-semibold border border-amber-100">
                      <span className="material-symbols-outlined text-[13px] fill-current">star</span>
                      {ownerRating.avgRating} ({ownerRating.totalReviews} đánh giá)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#1b64f2] font-medium bg-[#1b64f2]/5 px-2 py-0.5 rounded-lg border border-[#1b64f2]/10">
                      <span className="material-symbols-outlined text-[13px]">verified</span> Đối tác cho thuê
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 border-t border-gray-50 pt-4">
              {item.owner?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                  <span className="text-slate-700 font-medium">{item.owner.phone}</span>
                </div>
              )}
              {(item.owner?.address || item.location) && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                  <span className="text-slate-700 font-medium">{item.owner?.address || item.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHTSIDE */}
        <div className="w-full lg:w-1/3">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <h1 className="text-2xl font-bold text-slate-900 leading-snug">{item.name}</h1>
                <button onClick={handleToggleFavorite} title={item.isFavoritedByMe ? "Bỏ yêu thích" : "Yêu thích"} className={`flex-shrink-0 w-10 h-10 rounded-full transition-all cursor-pointer flex items-center justify-center border shadow-sm ${item.isFavoritedByMe ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' : 'bg-white border-gray-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${item.isFavoritedByMe ? 'fill-current' : ''}`}>favorite</span>
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-yellow-500 text-[14px] fill-current">star</span>
                  <span className="font-bold text-slate-800">{item.rating || 'Mới'}</span>
                  {item.numReviews > 0 && <span>({item.numReviews})</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  <span className="truncate max-w-[150px]">{item.owner?.address || item.location || 'Chưa rõ địa điểm'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-3xl font-black text-[#1b64f2]">{formatVND(item.pricePerDay)}</span>
                <span className="text-slate-400 font-medium text-xs pb-1">/ ngày</span>
              </div>
              <p className="text-xs text-slate-500 mb-5 font-medium">Kho: <span className="text-slate-900 font-bold">{item.quantity || 1}</span> sản phẩm</p>

              {!isProfileComplete && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">warning</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Cần bổ sung hồ sơ</p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">Bạn cần có số điện thoại và địa chỉ để gửi yêu cầu thuê.</p>
                      <Link to="/profile" className="text-xs font-bold text-[#1b64f2] hover:underline mt-1.5 inline-block">Cập nhật ngay →</Link>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleBook} className="flex flex-col gap-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-widest">Bắt đầu</label>
                    <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-gray-200 bg-slate-50 rounded-xl outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 text-sm text-slate-900 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-widest">Kết thúc</label>
                    <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-gray-200 bg-slate-50 rounded-xl outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 text-sm text-slate-900 transition-all font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-widest">Số lượng</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-[#1b64f2] hover:text-white transition-all duration-200 flex items-center justify-center font-bold text-lg cursor-pointer border border-gray-200 shadow-sm text-slate-600">−</button>
                    <span className="font-bold text-sm w-8 text-center text-slate-900">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(q => Math.min(item.quantity || 1, q + 1))} className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-[#1b64f2] hover:text-white transition-all duration-200 flex items-center justify-center font-bold text-lg cursor-pointer border border-gray-200 shadow-sm text-slate-600">+</button>
                    {availability && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 ml-1">Còn {availability.availableQuantity} sp</span>}
                  </div>
                </div>

                {availability && availability.availableQuantity === 0 && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-1">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">inventory_2</span>
                      <div>
                        <p className="text-xs font-bold text-red-800">Hết hàng thời gian này</p>
                        {availability.nextAvailableDate && <p className="text-xs text-red-600 mt-1">Dự kiến có lại: <span className="font-bold">{formatDate(availability.nextAvailableDate)}</span></p>}
                      </div>
                    </div>
                  </div>
                )}
                {availability && availability.availableQuantity > 0 && availability.availableQuantity < (item.quantity || 1) && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mt-1">
                    <p className="text-xs text-amber-800 font-medium"><span className="font-bold">⚡ Sắp hết!</span> Chỉ còn {availability.availableQuantity}/{item.quantity || 1} sản phẩm</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-widest">Lời nhắn (tuỳ chọn)</label>
                  <textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Mình cần đồ này để đi event..." className="w-full px-3 py-2.5 border border-gray-200 bg-slate-50 rounded-xl outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 text-sm text-slate-900 transition-all resize-none placeholder:text-slate-400" />
                </div>

                {(() => {
                  const outOfStock = availability && availability.availableQuantity === 0;
                  const canBook = item.status === 'AVAILABLE' && isProfileComplete && !outOfStock && quantity <= (availability?.availableQuantity ?? (item.quantity || 1));
                  return (
                    <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm flex justify-center items-center mt-2 ${canBook ? 'bg-[#1b64f2] text-white hover:bg-[#1554d4] cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-gray-200'}`} disabled={!canBook || bookingLoading}>
                      {bookingLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : outOfStock ? 'Hết hàng' : item.status !== 'AVAILABLE' ? 'Đang không có sẵn' : `Gửi yêu cầu thuê (${quantity} sp)`}
                    </button>
                  );
                })()}
              </form>
              <p className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider">Bạn chưa phải thanh toán lúc này</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Đánh giá từ người dùng</h3>
        {reviews.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-slate-200 text-5xl mb-3 block">rate_review</span>
            <p className="text-slate-400 text-sm font-medium">Chưa có đánh giá nào cho sản phẩm này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {review.reviewerId?.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-none mb-1">{review.reviewerId}</h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{review.createdAt?.split('T')[0] || 'Gần đây'}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}`}>star</span>)}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-50">{review.comment || 'Không có bình luận.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
