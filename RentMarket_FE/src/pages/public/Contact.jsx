import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="py-12 bg-[#f8f9fa] min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về nền tảng RentalMarket.</p>
        
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left: Form */}
          <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Gửi tin nhắn cho chúng tôi</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/20 focus:border-[#1b64f2] transition-colors" placeholder="Nhập tên của bạn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/20 focus:border-[#1b64f2] transition-colors" placeholder="Nhập số điện thoại (tuỳ chọn)" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/20 focus:border-[#1b64f2] transition-colors" placeholder="Nhập email của bạn" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đề *</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/20 focus:border-[#1b64f2] transition-colors" placeholder="Bạn cần hỗ trợ về vấn đề gì?" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung *</label>
                <textarea required rows="4" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b64f2]/20 focus:border-[#1b64f2] transition-colors resize-none" placeholder="Nhập chi tiết nội dung cần hỗ trợ..."></textarea>
              </div>
              
              <div className="pt-2">
                <button type="button" className="w-full px-4 py-3 bg-[#1b64f2] text-white font-medium rounded-xl hover:bg-[#1554d4] transition-all shadow-sm shadow-[#1b64f2]/30 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Gửi Yêu Cầu
                </button>
              </div>
            </form>
          </div>
          
          {/* Right: Info & Socials & map CTA */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Thông tin liên lạc</h3>
              
              <div className="flex flex-col gap-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1b64f2]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#1b64f2] text-[20px]">location_on</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Trụ sở chính</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">123 Đường Công Nghệ, Quận 1, Tp. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">call</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Điện thoại</p>
                    <p className="text-sm text-slate-500 mt-1">1900 1234 (Hotline 24/7)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">mail</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email Hỗ Trợ</p>
                    <p className="text-sm text-slate-500 mt-1">support@codespheree.id.vn</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-sm font-medium text-slate-900 mb-3">Kết nối với chúng tôi:</p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold font-serif text-lg">
                    f
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all font-bold text-lg">
                    in
                  </a>
                  <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-gray-800 hover:bg-gray-100 transition-all">
                    <span className="material-symbols-outlined text-[20px]">code</span>
                  </a>
                </div>
              </div>

              {/* CTA Secondary */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Cần hỗ trợ trực tiếp?</p>
                    <p className="text-xs text-slate-500 mt-0.5">Giờ hành chính: 8:00 - 18:00</p>
                  </div>
                  <Link to="/chat" className="px-4 py-2 bg-white text-[#1b64f2] text-sm font-medium rounded-lg border border-slate-200 shadow-sm hover:border-[#1b64f2] hover:text-[#1554d4] transition-colors whitespace-nowrap">
                    Chat ngay
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62700.342424246715!2d106.72050098055068!3d10.828798371421087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c3debb5aad%3A0x5fb58956eb4194d0!2zxJDhuqFpIEjhu41jIEh1dGVjaCBLaHUgRQ!5e0!3m2!1svi!2s!4v1774965830332!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>

      </div>
    </div>
  );
};

export default Contact;
