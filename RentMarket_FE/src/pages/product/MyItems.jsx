import { useState, useEffect } from 'react';
import { getMyItems, deleteItem, createItem, updateItem, uploadItemImage, getAllCategories } from '../../services/productService';
import { getMyInfo } from '../../services/authService';
import { LoadingSpinner, EmptyState, Toast, ConfirmDialog } from '../../components/common';
import ItemCard from '../../components/product/ItemCard';
import ItemFormModal from '../../components/product/ItemFormModal';
import { Link } from 'react-router-dom';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', pricePerDay: '', categoryId: '', quantity: 1 });
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: null });
  const [userProfile, setUserProfile] = useState(null);

  const isProfileComplete = userProfile?.phone && userProfile?.address;

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes, userRes] = await Promise.allSettled([getMyItems(0, 50), getAllCategories(), getMyInfo()]);
      if (itemsRes.status === 'fulfilled' && itemsRes.value.result) setItems(itemsRes.value.result.data || itemsRes.value.result.content || []);
      if (catRes.status === 'fulfilled' && catRes.value.result) setCategories(catRes.value.result);
      if (userRes.status === 'fulfilled' && userRes.value.result) setUserProfile(userRes.value.result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyItems(); }, []);

  const handleOpenModal = (item = null) => {
    if (!item && !isProfileComplete) {
      setToast({ message: 'Bạn cần cập nhật số điện thoại và địa chỉ trong profile trước khi đăng đồ', type: 'warning' });
      return;
    }
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, description: item.description, pricePerDay: item.pricePerDay, categoryId: item.category?.id || '', quantity: item.quantity || 1 });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', pricePerDay: '', categoryId: '', quantity: 1 });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedItem;
      if (editingItem) savedItem = await updateItem(editingItem.id, formData);
      else savedItem = await createItem(formData);
      if (imageFile && savedItem?.result) await uploadItemImage(savedItem.result.id, imageFile);
      setIsModalOpen(false);
      setToast({ message: editingItem ? 'Cập nhật thành công!' : 'Đăng tin thành công!', type: 'success' });
      fetchMyItems();
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(confirmDialog.itemId);
      setConfirmDialog({ isOpen: false, itemId: null });
      setToast({ message: 'Đã xóa sản phẩm!', type: 'success' });
      fetchMyItems();
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleFormChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8 bg-[#f8f9fa] min-h-[80vh]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Quản lý Kho đồ của tôi</h1>
          <p className="text-slate-500 text-sm">Danh sách các món đồ bạn đang cung cấp trên nền tảng.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#1b64f2] hover:bg-[#1554d4] text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-sm shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span> Đăng đồ mới
        </button>
      </div>

      {!isProfileComplete && !loading && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 shadow-sm">
          <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">warning</span>
          <div>
            <p className="text-sm font-bold text-amber-800 uppercase tracking-wider">Hoàn thiện hồ sơ để đăng đồ</p>
            <p className="text-xs text-amber-700 mt-1">Bạn cần cập nhật số điện thoại và địa chỉ trước khi tạo tin đăng mới.</p>
            <Link to="/profile" className="mt-2 text-xs font-bold text-[#1b64f2] hover:underline inline-block">Cập nhật profile →</Link>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : items.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="Chưa có món đồ nào"
          description="Bắt đầu kiếm tiền bằng cách cho thuê đồ ít dùng trên RentMarket."
          action={<button onClick={() => handleOpenModal()} className="text-[#1b64f2] font-semibold text-sm hover:underline cursor-pointer border border-[#1b64f2] px-6 py-2 rounded-xl mt-2">Đăng món đồ đầu tiên</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard key={item.id} item={item} onEdit={handleOpenModal} onDelete={(id) => setConfirmDialog({ isOpen: true, itemId: id })} />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, itemId: null })}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận Xóa"
        confirmColor="bg-red-500 hover:bg-red-600 border-red-500 text-white"
      />

      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onImageChange={setImageFile}
        categories={categories}
        isEditing={!!editingItem}
      />
    </div>
  );
};

export default MyItems;
