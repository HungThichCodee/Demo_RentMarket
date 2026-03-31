const Footer = () => (
  <footer className="w-full bg-white border-t border-gray-100 py-8 mt-auto">
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#1b64f2] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[14px]">handshake</span>
        </div>
        <span className="text-sm text-slate-500">© {new Date().getFullYear()} RentalMarket, Inc.</span>
      </div>
      <div className="flex gap-5 text-sm text-slate-400">
        <a className="hover:text-[#1b64f2] transition-colors cursor-pointer">Privacy</a>
        <a className="hover:text-[#1b64f2] transition-colors cursor-pointer">Terms</a>
        <a className="hover:text-[#1b64f2] transition-colors cursor-pointer">Sitemap</a>
      </div>
      <div className="flex gap-3 text-slate-400">
        <span className="material-symbols-outlined cursor-pointer hover:text-[#1b64f2] transition-colors text-[20px]">language</span>
        <span className="material-symbols-outlined cursor-pointer hover:text-[#1b64f2] transition-colors text-[20px]">attach_money</span>
      </div>
    </div>
  </footer>
);

export default Footer;
