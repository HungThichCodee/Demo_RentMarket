import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMyInfo, updateUser, uploadAvatar } from '../../services/authService';
import { getMyWallet } from '../../services/rentalService';
import { getReviewsWrittenByUser, getUserReviews } from '../../services/reviewService';
import { getAvatarUrl } from '../../utils/imageHelper';
import { formatVND } from '../../utils/currency';
import { Toast } from '../../components/common';

const FIELD_CLS = "w-full px-3 py-2.5 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";

const Profile = () => {
  const [user, setUser]         = useState(null);
  const [wallet, setWallet]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', address: ''
  });
  const [saving, setSaving]             = useState(false);
  const [activeTab, setActiveTab]       = useState('info');
  const [myWrittenReviews, setMyWrittenReviews] = useState([]);
  const [receivedReviews, setReceivedReviews]   = useState([]);
  const [reviewsLoading, setReviewsLoading]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [avatarUploading, setAvatarUploading]   = useState(false);
  const avatarInputRef = useRef(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const [userRes, walletRes] = await Promise.allSettled([getMyInfo(), getMyWallet()]);
      if (userRes.status === 'fulfilled' && userRes.value.result) {
        const me = userRes.value.result;
        setUser(me);
        setFormData({ firstName: me.firstName||'', lastName: me.lastName||'', email: me.email||'', password: '', phone: me.phone||'', address: me.address||'' });
      }
      if (walletRes.status === 'fulfilled' && walletRes.value.result) setWallet(walletRes.value.result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    if (!user) return;
    setReviewsLoading(true);
    try {
      const [writtenRes, receivedRes] = await Promise.allSettled([
        getReviewsWrittenByUser(user.username),
        getUserReviews(user.username)
      ]);
      if (writtenRes.status === 'fulfilled' && writtenRes.value.result) setMyWrittenReviews(writtenRes.value.result.content || []);
      if (receivedRes.status === 'fulfilled' && receivedRes.value.result) setReceivedReviews(receivedRes.value.result.content || []);
    } catch (err) { console.error(err); }
    finally { setReviewsLoading(false); }
  };

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if ((activeTab === 'written' || activeTab === 'received') && user) fetchReviews(); }, [activeTab, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updateData = { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, address: formData.address };
      if (formData.password) updateData.password = formData.password;
      await updateUser(user.id, updateData);
      setToast({ message: 'Cập nhật thành công!', type: 'success' });
      setEditing(false);
      setFormData(prev => ({ ...prev, password: '' }));
      fetchUser();
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setToast({ message: 'Kích thước ảnh tối đa 3MB', type: 'error' }); return; }
    try {
      setAvatarUploading(true);
      await uploadAvatar(file);
      setToast({ message: 'Cập nhật ảnh đại diện thành công!', type: 'success' });
      fetchUser();
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setAvatarUploading(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" />
    </div>
  );

  if (!user) return (
    <div className="mx-auto max-w-[960px] px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-red-500">Không tải được thông tin người dùng</h2>
    </div>
  );

  const avatarSrc = getAvatarUrl(user.avatarUrl);
  const tabs = [
    { id: 'info',     label: 'Thông tin',          icon: 'person' },
    { id: 'wallet',   label: 'Ví & Tài chính',      icon: 'account_balance_wallet' },
    { id: 'written',  label: 'Đánh giá đã viết',    icon: 'rate_review' },
    { id: 'received', label: 'Đánh giá nhận được',  icon: 'reviews' },
  ];

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-[15px] ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}>star</span>
      ))}
    </div>
  );

  const renderReviewCard = (review) => (
    <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1b64f2]/10 flex items-center justify-center font-bold text-[#1b64f2] text-sm">
            {(review.reviewerId || 'U').substring(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{review.reviewerId}</p>
            <span className="text-[10px] text-slate-400">{review.createdAt?.split('T')[0] || 'Gần đây'}</span>
          </div>
        </div>
        {renderStars(review.rating)}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.comment || 'Không có bình luận.'}</p>
      <p className="mt-2 text-[10px] text-slate-400">Sản phẩm #{review.productId} • Booking #{review.bookingId}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[960px] px-4 md:px-10 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Profile Header ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-5">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-[#1b64f2]/15" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1b64f2] flex items-center justify-center text-white text-2xl font-bold">
                {user.username?.substring(0, 1).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {avatarUploading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
              }
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-grow min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h1>
            <p className="text-slate-500 text-sm">@{user.username}</p>
            <div className="flex gap-1.5 mt-1.5">
              {user.roles && [...user.roles].map(role => (
                <span key={role} className="px-2 py-0.5 bg-[#1b64f2]/8 text-[#1b64f2] text-[11px] font-semibold rounded-full">{role}</span>
              ))}
            </div>
          </div>

          {/* Wallet mini */}
          {wallet && (
            <div className="hidden md:flex flex-col gap-0.5 text-right border-l border-gray-100 pl-5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Số dư ví</p>
              <p className="text-xl font-bold text-emerald-600">{formatVND(wallet.availableBalance || 0)}</p>
              <p className="text-[10px] text-slate-400">Đóng băng: {formatVND(wallet.frozenBalance || 0)}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#1b64f2] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Thông tin cá nhân ── */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {!editing ? (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-bold text-slate-900">Thông tin cá nhân</h2>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[#1b64f2] hover:text-blue-700 text-sm font-medium cursor-pointer">
                  <span className="material-symbols-outlined text-[17px]">edit</span>
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Tên đăng nhập', value: user.username,  icon: 'person' },
                  { label: 'Email',          value: user.email,     icon: 'mail' },
                  { label: 'Tên',            value: user.firstName, icon: 'badge' },
                  { label: 'Họ',             value: user.lastName,  icon: 'badge' },
                  { label: 'Điện thoại',     value: user.phone,     icon: 'phone' },
                  { label: 'Địa chỉ',        value: user.address,   icon: 'location_on' },
                ].map(field => (
                  <div key={field.label} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                    <span className="material-symbols-outlined text-[#1b64f2]/50 text-[18px]">{field.icon}</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{field.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{field.value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(!user.phone || !user.address) && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">warning</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Thông tin chưa đầy đủ</p>
                    <p className="text-xs text-amber-700 mt-0.5">Bạn cần cập nhật số điện thoại và địa chỉ để đăng hoặc thuê đồ.</p>
                    <button onClick={() => setEditing(true)} className="mt-1.5 text-xs font-semibold text-[#1b64f2] hover:underline cursor-pointer">Cập nhật ngay →</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-slate-900">Chỉnh sửa thông tin</h2>
                <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Tên</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={FIELD_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Họ</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={FIELD_CLS} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={FIELD_CLS} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Số điện thoại</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" className={FIELD_CLS} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Địa chỉ</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Quận 1, TP.HCM" className={FIELD_CLS} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Mật khẩu mới (để trống nếu không đổi)</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Nhập mật khẩu mới..." className={FIELD_CLS} />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm border border-gray-100 transition-colors cursor-pointer">Hủy</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl font-medium text-sm transition-colors cursor-pointer disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Tab: Ví & Tài chính ── */}
      {activeTab === 'wallet' && (
        <div className="space-y-5">
          {wallet ? (
            <>
              {/* Số dư cards — giữ gradient vì là visual focal point */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                    <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-sm font-medium flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[16px]">payments</span>Tiền có thể sử dụng
                    </p>
                    <h2 className="text-3xl font-bold mb-0.5">{formatVND(wallet.availableBalance || 0)}</h2>
                    <p className="text-xs text-emerald-100">Dùng để thanh toán đơn thuê hoặc rút</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                    <span className="material-symbols-outlined text-[100px]">lock_clock</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-amber-100 text-sm font-medium flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[16px]">lock</span>Tiền trung gian (Escrow)
                    </p>
                    <h2 className="text-3xl font-bold mb-0.5">{formatVND(wallet.frozenBalance || 0)}</h2>
                    <p className="text-xs text-amber-100">Đang bị khóa — hoàn lại sau khi đơn kết thúc</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Quản lý ví</h3>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  <Link to="/wallet" className="flex items-center gap-2 px-5 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Nạp tiền vào ví
                  </Link>
                  <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed border border-gray-100" title="Sắp ra mắt">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    Rút tiền (Sắp ra mắt)
                  </button>
                </div>
                <div className="flex items-start gap-2.5 p-3.5 bg-[#1b64f2]/5 border border-[#1b64f2]/10 rounded-xl">
                  <span className="material-symbols-outlined text-[#1b64f2] text-[16px] mt-0.5 shrink-0">info</span>
                  <p className="text-xs text-[#1b64f2] leading-relaxed">
                    <span className="font-semibold">Cơ chế Escrow:</span> Khi thanh toán, tiền bị khóa trong ví. Nếu chủ đồ từ chối, 100% hoàn lại. Hoàn tất: tiền cọc về bạn, 70% tiền thuê về chủ đồ, 30% phí sàn.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">account_balance_wallet</span>
              <p className="text-slate-400 mb-3">Không thể tải thông tin ví.</p>
              <button onClick={fetchUser} className="text-[#1b64f2] hover:underline text-sm font-medium cursor-pointer">Thử lại</button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Đánh giá đã viết ── */}
      {activeTab === 'written' && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Đánh giá tôi đã viết</h2>
          {reviewsLoading
            ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-t-[#1b64f2]" /></div>
            : myWrittenReviews.length === 0
              ? <div className="bg-white rounded-2xl p-12 text-center border border-gray-100"><span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">rate_review</span><p className="text-slate-400">Bạn chưa viết đánh giá nào.</p></div>
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{myWrittenReviews.map(renderReviewCard)}</div>
          }
        </div>
      )}

      {/* ── Tab: Đánh giá nhận được ── */}
      {activeTab === 'received' && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Đánh giá tôi nhận được</h2>
          {reviewsLoading
            ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-t-[#1b64f2]" /></div>
            : receivedReviews.length === 0
              ? <div className="bg-white rounded-2xl p-12 text-center border border-gray-100"><span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">reviews</span><p className="text-slate-400">Chưa có ai đánh giá bạn.</p></div>
              : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{receivedReviews.map(renderReviewCard)}</div>
          }
        </div>
      )}
    </div>
  );
};

export default Profile;
