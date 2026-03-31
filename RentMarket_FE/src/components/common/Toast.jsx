import { useState, useEffect } from 'react';

/**
 * Toast notification — Clean Light Theme.
 * Auto-dismiss sau 3.5 giây.
 */
const Toast = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      wrap: 'bg-white border-emerald-200 shadow-emerald-100/80',
      icon: 'text-emerald-500',
      text: 'text-slate-800',
      name: 'check_circle',
    },
    error: {
      wrap: 'bg-white border-red-200 shadow-red-100/80',
      icon: 'text-red-500',
      text: 'text-slate-800',
      name: 'error',
    },
    warning: {
      wrap: 'bg-white border-amber-200 shadow-amber-100/80',
      icon: 'text-amber-500',
      text: 'text-slate-800',
      name: 'warning',
    },
    info: {
      wrap: 'bg-white border-[#1b64f2]/20 shadow-[#1b64f2]/10',
      icon: 'text-[#1b64f2]',
      text: 'text-slate-800',
      name: 'info',
    },
  };

  const c = config[type] || config.info;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all duration-300 min-w-[280px] max-w-sm
        ${c.wrap} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
    >
      <span className={`material-symbols-outlined text-[20px] shrink-0 ${c.icon}`}>{c.name}</span>
      <span className={`flex-1 font-medium ${c.text}`}>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
};

export default Toast;
