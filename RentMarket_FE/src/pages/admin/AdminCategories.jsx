import { useState, useEffect } from 'react';
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '../../services/productService';

const flattenCategories = (cats, level = 0) => {
  let result = [];
  cats.forEach(c => {
    result.push({ ...c, flatName: level > 0 ? `${'— '.repeat(level)}${c.name}` : c.name, level });
    if (c.children && c.children.length > 0) {
      result = result.concat(flattenCategories(c.children, level + 1));
    }
  });
  return result;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, editing: null });
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategoryTree();
      if (res.result) setCategories(res.result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setModal({ isOpen: true, editing: cat });
      setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' });
    } else {
      setModal({ isOpen: true, editing: null });
      setForm({ name: '', description: '', parentId: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, parentId: form.parentId ? Number(form.parentId) : null };
      if (modal.editing) await updateCategory(modal.editing.id, payload);
      else await createCategory(payload);
      setModal({ isOpen: false, editing: null });
      fetchCategories();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try { await deleteCategory(id); fetchCategories(); }
      catch (err) { alert(err.message); }
    }
  };

  const flattenedList = flattenCategories(categories);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Quản lý danh mục</h1>
          <p className="text-slate-500 text-sm">Tổng cộng {flattenedList.length} danh mục phân cấp</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#1b64f2] hover:bg-[#1554d4] text-white font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" /></div>
      ) : flattenedList.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
          <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">category</span>
          <p className="text-slate-500 font-medium">Chưa có danh mục nào.</p>
          <button onClick={() => openModal()} className="mt-3 text-[#1b64f2] font-semibold hover:underline cursor-pointer text-sm">Tạo danh mục đầu tiên</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Cấu trúc cây danh mục</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flattenedList.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${cat.level * 1.5}rem` }}>
                        <span className={`material-symbols-outlined text-[18px] ${cat.level === 0 ? 'text-[#1b64f2]' : 'text-slate-400'}`}>
                          {cat.level === 0 ? 'folder' : 'subdirectory_arrow_right'}
                        </span>
                        <span className={`font-medium ${cat.level === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">#{cat.id}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#1b64f2] hover:bg-[#1b64f2]/10 cursor-pointer transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">{modal.editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setModal({ isOpen: false, editing: null })} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Tên danh mục</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1b64f2]/10 focus:border-[#1b64f2]/50 focus:bg-white outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400" placeholder="Ví dụ: Máy ảnh, Xe đạp..." />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Danh mục cha (Tùy chọn)</label>
                <select 
                  value={form.parentId || ''} 
                  onChange={e => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1b64f2]/10 focus:border-[#1b64f2]/50 focus:bg-white outline-none text-sm text-slate-900 transition-all"
                >
                  <option value="">(Không có - Tạo nút gốc)</option>
                  {flattenedList.map(cat => (
                    <option key={cat.id} value={cat.id} disabled={modal.editing?.id === cat.id}>
                      {cat.flatName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Mô tả (tùy chọn)</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1b64f2]/10 focus:border-[#1b64f2]/50 focus:bg-white outline-none text-sm text-slate-900 transition-all resize-none placeholder:text-slate-400" placeholder="Mô tả ngắn gọn..."></textarea>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setModal({ isOpen: false, editing: null })} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition-colors cursor-pointer border border-gray-100">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1b64f2] hover:bg-[#1554d4] text-white rounded-xl font-medium text-sm shadow-sm transition-colors cursor-pointer">
                  {modal.editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
