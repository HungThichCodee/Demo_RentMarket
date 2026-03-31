import Modal from '../common/Modal';

const FIELD_CLS = "w-full px-3 py-2.5 border border-gray-200 bg-slate-50 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm outline-none focus:border-[#1b64f2] focus:ring-2 focus:ring-[#1b64f2]/10 focus:bg-white transition-all";

const ItemFormModal = ({ isOpen, onClose, formData, onChange, onSubmit, onImageChange, categories, isEditing }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Sửa tin đăng' : 'Tạo tin đăng mới'} maxWidth="max-w-lg">
    <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tiêu đề</label>
        <input required type="text" value={formData.name}
          onChange={e => onChange('name', e.target.value)}
          className={FIELD_CLS} placeholder="Ví dụ: Máy ảnh Sony A7III"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Danh mục</label>
        <select required value={formData.categoryId}
          onChange={e => onChange('categoryId', e.target.value)}
          className={FIELD_CLS}
        >
          <option value="" disabled>Chọn danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Giá thuê/ngày (₫)</label>
          <input required type="number" min="1" value={formData.pricePerDay}
            onChange={e => onChange('pricePerDay', e.target.value)}
            className={FIELD_CLS} placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Số lượng</label>
          <input required type="number" min="1" value={formData.quantity || 1}
            onChange={e => onChange('quantity', parseInt(e.target.value) || 1)}
            className={FIELD_CLS} placeholder="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Mô tả</label>
        <textarea required rows="4" value={formData.description}
          onChange={e => onChange('description', e.target.value)}
          className={`${FIELD_CLS} resize-none`}
          placeholder="Mô tả tình trạng, quy định và phụ kiện đi kèm..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Ảnh đại diện</label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 hover:border-[#1b64f2]/40 transition-colors">
          <input type="file" onChange={e => onImageChange(e.target.files[0])} accept="image/*" className="w-full text-sm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#1b64f2]/8 file:text-[#1b64f2] hover:file:bg-[#1b64f2]/15 cursor-pointer" />
        </div>
        {isEditing && <p className="text-xs text-slate-400 mt-1">Để trống nếu không muốn thay ảnh.</p>}
      </div>

      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm border border-gray-100 transition-colors cursor-pointer">
          Hủy
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl font-medium text-sm transition-colors cursor-pointer shadow-sm">
          {isEditing ? 'Lưu thay đổi' : 'Đăng tin'}
        </button>
      </div>
    </form>
  </Modal>
);

export default ItemFormModal;
