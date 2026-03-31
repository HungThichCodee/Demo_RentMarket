import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../services/authService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      if (res.result) setUsers(res.result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${username}"? Hành động này không thể hoàn tác.`)) {
      try { await deleteUser(userId); fetchUsers(); }
      catch (err) { alert(err.message); }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Quản lý người dùng</h1>
          <p className="text-slate-500 text-sm">Tổng cộng {users.length} người dùng đã đăng ký</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]" /></div>
        ) : users.length === 0 ? (
          <div className="p-14 text-center">
            <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">group</span>
            <p className="text-slate-500 font-medium">Không có người dùng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Tên đăng nhập</th>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 flex justify-end">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1b64f2]/10 flex items-center justify-center text-[#1b64f2] text-xs font-bold shrink-0">
                          {u.username?.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.roles && [...u.roles].map(role => (
                          <span key={role} className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-[#1b64f2]/10 text-[#1b64f2]'
                          }`}>{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(u.id, u.username)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors" title="Xóa người dùng">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
