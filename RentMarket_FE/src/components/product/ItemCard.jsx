import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageHelper';
import { formatVND } from '../../utils/currency';

/**
 * ItemCard — Clean Light Theme
 * Card hiển thị 1 sản phẩm trong Kho đồ (MyItems).
 */
const statusConfig = {
  AVAILABLE:   { label: 'Sẵn sàng',  cls: 'bg-emerald-500 text-white' },
  RENTED:      { label: 'Đang thuê', cls: 'bg-[#1b64f2] text-white' },
  UNAVAILABLE: { label: 'Không có',  cls: 'bg-slate-400 text-white' },
};

const ItemCard = ({ item, onEdit, onDelete }) => {
  const status = statusConfig[item.status] ?? { label: item.status, cls: 'bg-slate-400 text-white' };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* Ảnh sản phẩm */}
      <div className="w-full aspect-[4/3] overflow-hidden bg-slate-50 relative">
        <img
          src={item.images && item.images.length > 0 ? getImageUrl(item.images[0].imageUrl) : getImageUrl(null)}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
        />
        {/* Status badge */}
        <span className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 ${status.cls} text-[11px] font-semibold rounded-full`}>
          {status.label}
        </span>
      </div>

      {/* Nội dung */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-slate-900 mb-0.5 truncate">{item.name}</h3>
        <p className="text-slate-400 text-xs mb-3 line-clamp-2 min-h-[32px] leading-relaxed">{item.description}</p>

        {/* Giá */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="font-bold text-base text-[#1b64f2]">{formatVND(item.pricePerDay)}</span>
          <span className="text-xs text-slate-400 font-normal">/ngày</span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <Link
            to={`/product/${item.id}`}
            className="flex items-center gap-1 text-slate-400 hover:text-[#1b64f2] transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>{item.viewCount || 0} lượt xem</span>
          </Link>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(item)}
              title="Chỉnh sửa"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-[#1b64f2] hover:text-white transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="Xóa"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
