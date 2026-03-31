import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';

/**
 * Thanh nhập tin nhắn.
 * Submit bằng Enter hoặc click nút Send.
 * Bị disable khi WebSocket chưa kết nối (isConnected = false).
 */
const ChatInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText('');
  }, [text, onSend, disabled]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="flex items-center gap-3 p-4 bg-white border-t border-gray-100">
      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Đang kết nối lại...' : 'Nhập tin nhắn...'}
          disabled={disabled}
          className="
            w-full px-5 py-3 pr-12
            bg-surface border border-gray-200 rounded-full
            text-sm text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        className="
          flex items-center justify-center
          w-11 h-11 rounded-full
          bg-primary text-white
          hover:bg-primary/90 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          transition-all duration-200
          shadow-sm hover:shadow-md
          cursor-pointer
        "
      >
        <Send size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
};

export default ChatInput;
