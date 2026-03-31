import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getCategoryTree, addFavorite, removeFavorite } from '../../services/productService';
import { getImageUrl } from '../../utils/imageHelper';
import { formatVND } from '../../utils/currency';

const CategoryTreeNode = ({ category, selectedCategory, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedCategory === category.id;
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="pl-3 mt-1">
      <div 
        className={`flex items-center justify-between py-1.5 px-3 rounded-xl cursor-pointer transition-all duration-200 ${
          isSelected ? 'bg-[#1b64f2]/10 text-[#1b64f2] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
        }`}
        onClick={() => {
           if (hasChildren) setIsExpanded(!isExpanded);
           onSelect(category.id);
        }}
      >
        <span className="text-sm truncate select-none">{category.name}</span>
        {hasChildren && (
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#1b64f2]' : 'text-slate-400'}`}>
            chevron_right
          </span>
        )}
      </div>
      
      {hasChildren && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-1 pl-1 ml-3 border-l-2 border-slate-100' : 'max-h-0 opacity-0'}`}>
          {category.children.map(child => (
            <CategoryTreeNode 
              key={child.id} 
              category={child} 
              selectedCategory={selectedCategory} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Search & filter state
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchApplied, setSearchApplied] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const fetchItems = async (page = 0, criteria = {}) => {
    try {
      setLoading(true);
      const itemRes = await getItems(page, pageSize, 'createdAt', 'desc', criteria);
      if (itemRes.result) {
        setItems(itemRes.result.data || itemRes.result.content || []);
        setTotalPages(itemRes.result.totalPages || 1);
        setCurrentPage(itemRes.result.currentPage ?? itemRes.result.number ?? page);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await getCategoryTree();
        if (catRes.result) setCategories(catRes.result);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const criteria = { ...searchApplied };
    if (selectedCategory) criteria.categoryId = selectedCategory;
    fetchItems(0, criteria);
  }, [selectedCategory, searchApplied]);

  const handleSearch = (e) => {
    e.preventDefault();
    const criteria = {};
    if (keyword.trim()) criteria.keyword = keyword.trim();
    if (minPrice) criteria.minPrice = minPrice;
    if (maxPrice) criteria.maxPrice = maxPrice;
    setSearchApplied(criteria);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setSearchApplied({});
    setSelectedCategory(null);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    const criteria = { ...searchApplied };
    if (selectedCategory) criteria.categoryId = selectedCategory;
    fetchItems(page, criteria);
  };

  const handleToggleFavorite = async (item) => {
    try {
      if (item.isFavoritedByMe) {
        await removeFavorite(item.id);
        setItems(items.map(i => i.id === item.id ? { ...i, isFavoritedByMe: false } : i));
      } else {
        await addFavorite(item.id);
        setItems(items.map(i => i.id === item.id ? { ...i, isFavoritedByMe: true } : i));
      }
    } catch (error) {
      alert(error.message || 'Vui lòng đăng nhập để thực hiện');
    }
  };

  const hasActiveFilters = keyword || minPrice || maxPrice || selectedCategory;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ══ HERO SECTION — Clean Light ══ */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-10 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
              Thuê mọi thứ,<br />
              <span className="text-[#1b64f2]">ở mọi nơi</span>
            </h1>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Kết nối với cộng đồng để tìm thiết bị, công cụ và vật dụng cần thuê với giá tốt nhất.
            </p>

            {/* ── Search Bar — Clean ── */}
            <form onSubmit={handleSearch}>
              <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#1b64f2]/30 focus-within:border-[#1b64f2]/50 focus-within:ring-2 focus-within:ring-[#1b64f2]/8 transition-all duration-200">
                {/* Keyword input */}
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full h-11 pl-10 pr-3 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-sm"
                  />
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px bg-gray-100 my-1.5" />

                {/* Price range */}
                <div className="flex items-center gap-2 px-2">
                  <input
                    type="number" min="0"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Từ"
                    className="w-20 h-9 px-2 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 outline-none text-xs border border-transparent focus:border-[#1b64f2]/40 focus:bg-white transition-all"
                  />
                  <span className="text-slate-300 text-xs">—</span>
                  <input
                    type="number" min="0"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Đến"
                    className="w-20 h-9 px-2 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 outline-none text-xs border border-transparent focus:border-[#1b64f2]/40 focus:bg-white transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#1b64f2] hover:bg-[#1554d4] active:scale-95 text-white font-medium rounded-xl transition-all duration-150 cursor-pointer text-sm whitespace-nowrap"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-6">
              {[
                { icon: 'verified', text: 'Người bán kiểm duyệt' },
                { icon: 'shield', text: 'Thanh toán an toàn' },
                { icon: 'support_agent', text: 'Hỗ trợ 24/7' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-[#1b64f2] text-[16px]">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT (SIDEBAR + CONTENT) ══ */}
      <div className="mx-auto max-w-[1280px] w-full px-4 md:px-10 py-8 flex flex-col md:flex-row gap-6 items-start">
        
        {/* ── SIDEBAR CATEGORY TREE ── */}
        <div className="bg-white border text-slate-700 border-gray-100 rounded-2xl p-5 shadow-sm w-full md:w-64 flex-shrink-0 sticky top-24">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1b64f2] text-[20px]">account_tree</span>
            Danh mục sản phẩm
          </h3>
          
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm transition-all duration-200 mb-2 ${!selectedCategory ? 'bg-[#1b64f2] text-white font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            Hiển thị toàn bộ
          </button>
          
          <div className="flex flex-col gap-0.5 min-h-[150px]">
            {categories.map(rootCat => (
              <CategoryTreeNode 
                key={rootCat.id}
                category={rootCat}
                selectedCategory={selectedCategory}
                onSelect={(id) => setSelectedCategory(id)}
              />
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT (FILTERS + GRID) ── */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* ══ ACTIVE FILTER CHIPS ══ */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-slate-400 font-medium mr-1">Đang lọc:</span>
              {keyword && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b64f2]/5 text-[#1b64f2] border border-[#1b64f2]/15 text-xs font-medium rounded-full">
                  <span className="material-symbols-outlined text-[12px]">search</span>
                  {keyword}
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b64f2]/5 text-[#1b64f2] border border-[#1b64f2]/15 text-xs font-medium rounded-full">
                  <span className="material-symbols-outlined text-[12px]">category</span>
                  Đã chọn mục phân nhánh
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b64f2]/5 text-[#1b64f2] border border-[#1b64f2]/15 text-xs font-medium rounded-full">
                  Từ {formatVND(minPrice)}
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1b64f2]/5 text-[#1b64f2] border border-[#1b64f2]/15 text-xs font-medium rounded-full">
                  Đến {formatVND(maxPrice)}
                </span>
              )}
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1 px-3 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs font-medium rounded-full cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
                Xoá tất cả
              </button>
            </div>
          )}

          {/* ══ PRODUCTS GRID ══ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 text-lg md:text-xl font-bold">
                {hasActiveFilters ? 'Kết quả tìm kiếm' : 'Sản phẩm mới nhất'}
              </h2>
              <span className="text-sm text-slate-500">{items.length} sản phẩm</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-[#1b64f2]" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-slate-200 text-6xl mb-4 block">search_off</span>
                <p className="text-slate-400 text-base">Không tìm thấy sản phẩm nào phù hợp.</p>
                {hasActiveFilters && (
                  <button onClick={handleClearSearch} className="mt-4 text-[#1b64f2] font-medium hover:underline cursor-pointer text-sm">
                    Xóa bộ lọc và xem tất cả
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                  {items.map((item) => (
                    /* ── Product Card — Clean Light ── */
                    <Link
                      to={`/product/${item.id}`}
                      key={item.id}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      {/* Ảnh */}
                      <div className="w-full aspect-[4/3] overflow-hidden bg-slate-50 relative">
                        <img
                          src={item.images && item.images.length > 0 ? getImageUrl(item.images[0].imageUrl) : getImageUrl(null)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />

                        {/* Nút yêu thích */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(item); }}
                          title={item.isFavoritedByMe ? 'Bỏ yêu thích' : 'Yêu thích'}
                          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
                            item.isFavoritedByMe
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            {item.isFavoritedByMe ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>

                        {/* Badge danh mục */}
                        {item.category?.name && (
                          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-slate-700 border border-white/60 backdrop-blur-sm shadow-sm truncate max-w-[120px]">
                            {item.category.name}
                          </span>
                        )}
                      </div>

                      {/* Nội dung */}
                      <div className="flex flex-col p-4 gap-1 flex-grow">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-slate-900 leading-snug truncate">{item.name}</h3>
                          {/* Rating */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="material-symbols-outlined text-amber-400 text-[13px]">star</span>
                            <span className="text-[11px] font-semibold text-slate-500">{item.rating || 'Mới'}</span>
                          </div>
                        </div>

                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed min-h-[32px]">{item.description}</p>

                        {/* Giá */}
                        <div className="mt-auto pt-3 flex items-baseline gap-1 border-t border-gray-100">
                          <span className="font-bold text-[#1b64f2] text-sm">{formatVND(item.pricePerDay)}</span>
                          <span className="text-slate-400 text-xs">/ ngày</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-10">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-slate-500 hover:border-[#1b64f2] hover:text-[#1b64f2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-9 h-9 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer border ${
                          i === currentPage
                            ? 'bg-[#1b64f2] text-white border-[#1b64f2] shadow-sm'
                            : 'bg-white border-gray-200 text-slate-600 hover:border-[#1b64f2] hover:text-[#1b64f2]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-slate-500 hover:border-[#1b64f2] hover:text-[#1b64f2] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
