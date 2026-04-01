const About = () => {
  return (
    <div className="py-12 bg-white">
      <div className="mx-auto max-w-[1000px] px-6 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Về RentalMarket</h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          RentalMarket là nền tảng thương mại điện tử chuyên biệt dành riêng cho việc cho thuê đồ dùng, thiết bị. Chúng tôi kết nối hàng ngàn người có nhu cầu thuê và cho thuê một cách an toàn, minh bạch và nhanh chóng.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1b64f2]/10 text-[#1b64f2] rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px]">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Uy Tín & An Toàn</h3>
            <p className="text-sm text-slate-500 text-center">Mọi giao dịch trên nền tảng đều được xác minh và bảo vệ bởi hệ thống ký quỹ thông minh.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1b64f2]/10 text-[#1b64f2] rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px]">bolt</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nhanh Chóng</h3>
            <p className="text-sm text-slate-500 text-center">Hệ thống tìm kiếm và gợi ý thông minh giúp bạn tìm được món đồ ưng ý chỉ trong vài phút.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-[#1b64f2]/10 text-[#1b64f2] rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px]">support_agent</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hỗ Trợ 24/7</h3>
            <p className="text-sm text-slate-500 text-center">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ giải quyết mọi thắc mắc của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
