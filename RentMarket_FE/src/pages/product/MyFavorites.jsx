import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyFavorites, removeFavorite } from '../../services/productService';
import { getImageUrl } from '../../utils/imageHelper';
import { formatVND } from '../../utils/currency';
import Toast from '../../components/common/Toast';

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getMyFavorites(0, 50);
      if (res.result && res.result.content) setFavorites(res.result.content);
      else if (res.result && res.result.data) setFavorites(res.result.data);
    } catch (error) { setToast({ message: "Lỗi tải danh sách yêu thích", type: "error" }); }
    finally { setLoading(false); }
  };

  const handleRemoveFavorite = async (itemId, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await removeFavorite(itemId);
      setFavorites(favorites.filter(f => f.id !== itemId));
      setToast({ message: "Đã xoá khỏi mục yêu thích", type: "success" });
    } catch (error) { setToast({ message: "Lỗi xoá yêu thích", type: "error" }); }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-8 bg-[#f8f9fa] min-h-[80vh]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Danh sách yêu thích</h1>
        <p className="text-slate-500 mt-1 text-sm">Những món đồ bạn đang quan tâm</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-[#1b64f2]"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm max-w-xl mx-auto mt-10">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-slate-300 text-4xl">favorite</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có gì ở đây!</h3>
          <p className="text-slate-500 mb-6 text-sm">Hãy dạo quanh một vòng và lưu lại những món đồ bạn thích nhé.</p>
          <Link to="/" className="inline-block bg-[#1b64f2] hover:bg-[#1554d4] text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm text-sm">
            Khám phá kho đồ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <Link to={`/product/${item.id}`} key={item.id} className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 block">
              <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100 relative">
                <img
                  src={item.images && item.images.length > 0 ? getImageUrl(item.images[0].imageUrl) : getImageUrl(null)}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button 
                  onClick={(e) => handleRemoveFavorite(item.id, e)}
                  title="Xoá khỏi yêu thích"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm hover:bg-rose-50 border border-gray-100 text-rose-500 transition-colors shadow-sm flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px] fill-current">close</span>
                </button>
              </div>
              <div className="flex flex-col p-4 gap-2">
                <h3 className="font-bold text-sm text-slate-900 leading-tight truncate">{item.name}</h3>
                <div className="mt-auto flex items-baseline gap-1 pt-3 border-t border-gray-50">
                  <span className="font-black text-[#1b64f2] text-lg">{formatVND(item.pricePerDay)}</span>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">/ ngày</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
