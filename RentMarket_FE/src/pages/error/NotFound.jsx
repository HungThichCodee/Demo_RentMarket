import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-[#1b64f2] mb-4">
        <span className="material-symbols-outlined text-[100px]">error</span>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-3">404 - Không tìm thấy trang</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        Opps! Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại URL.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-[#1b64f2] text-white font-medium hover:bg-[#1554d4] transition-colors shadow-sm flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">home</span>
        Quay lại Trang Chủ
      </Link>
    </div>
  );
};

export default NotFound;
