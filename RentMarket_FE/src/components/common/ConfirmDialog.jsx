/**
 * ConfirmDialog — Clean Light Theme.
 */
import { useState } from 'react';

const ConfirmDialog = ({
  isOpen, onClose, onConfirm,
  title = 'Xác nhận', message = 'Bạn có chắc chắn?',
  confirmText = 'Xác nhận', confirmColor = 'bg-[#1b64f2] hover:bg-[#1554d4]',
  showPrompt = false, promptLabel = 'Lý do'
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(showPrompt ? inputValue : true);
    setInputValue('');
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{message}</p>

          {showPrompt && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{promptLabel}</label>
              <textarea
                rows="3"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1b64f2]/15 focus:border-[#1b64f2]/50 outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all"
                placeholder={`Nhập ${promptLabel.toLowerCase()}...`}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition-colors cursor-pointer border border-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={showPrompt && !inputValue.trim()}
            className={`flex-1 py-2.5 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
