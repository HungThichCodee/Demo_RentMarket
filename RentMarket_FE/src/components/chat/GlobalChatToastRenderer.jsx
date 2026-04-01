import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalChat } from '../../context/GlobalChatContext';
import api from '../../services/api';
import { getDisplayName } from '../../utils/chatUtils';

const TOAST_DURATION_MS = 4500;

/**
 * GlobalChatToastRenderer — Render toast thông báo tin nhắn mới.
 *
 * Đặt trong MainLayout để luôn hiển thị dù user ở trang nào.
 * Tối đa 3 toast cùng lúc. Mỗi toast tự dismiss sau TOAST_DURATION_MS.
 * Click → navigate /chat?to=<sender>.
 */
const GlobalChatToastRenderer = () => {
  const { toastQueue, dismissToast } = useGlobalChat();
  const navigate = useNavigate();

  const visibleToasts = toastQueue.slice(-3);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
      {visibleToasts.map(({ id, senderId, senderName, content }, idx) => (
        <div
          key={id}
          className="pointer-events-auto"
          style={{
            transform:       `scale(${1 - (visibleToasts.length - 1 - idx) * 0.03})`,
            transformOrigin: 'top right',
          }}
        >
          <ChatToastCard
            id={id}
            senderId={senderId}
            senderName={senderName}
            content={content}
            onClose={() => dismissToast(id)}
            onClick={() => {
              dismissToast(id);
              navigate(`/chat?to=${senderId}`);
            }}
            onDismiss={dismissToast}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * ChatToastCard — Card thông báo 1 tin nhắn.
 *
 * Tự dismiss sau TOAST_DURATION_MS bằng useEffect setTimeout.
 * Progress bar CSS animation trực quan thời gian còn lại.
 * Keyboard accessible (Enter = click).
 */
const ChatToastCard = ({ id, senderId, senderName, content, onClose, onClick, onDismiss }) => {
  // 1. STOMP message có thể có senderName (nếu BE nạp sẵn), nếu không fallback về senderId
  const initialName = senderName || senderId;
  const [displaySender, setDisplaySender] = useState(() => 
    getDisplayName({ username: initialName, firstName: '', lastName: '' })
  );

  // 2. Fetch data thật từ Identity-service để hiện đúng "Nguyễn Văn A" thay vì username "admin"
  useEffect(() => {
    let active = true;
    
    // Nếu BE đã cấp sẵn tên hợp lệ và khác nguyên bản username, ta không cần tải thêm
    if (senderName && senderName !== senderId) return;

    if (senderId) {
      api.get(`/identity/users/by-username/${senderId}`)
        .then((res) => {
          if (active && res.data?.result) {
            setDisplaySender(getDisplayName(res.data.result));
          }
        })
        .catch(() => { /* im lặng, fallback vẫn giữ current displaySender */ });
    }
    return () => { active = false; };
  }, [senderId, senderName]);

  // Auto-dismiss sau TOAST_DURATION_MS
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Enter') onClick(); },
    [onClick],
  );

  return (
    <div
      className="
        relative flex items-center gap-3 overflow-hidden
        bg-white border border-[#1b64f2]/15
        shadow-lg shadow-[#1b64f2]/8
        rounded-2xl px-4 py-3
        min-w-[300px] max-w-sm
        cursor-pointer
        hover:border-[#1b64f2]/30 hover:shadow-[#1b64f2]/15
        transition-all duration-200
      "
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[#1b64f2]/10 flex items-center justify-center shrink-0">
        <span className="text-[#1b64f2] font-bold text-sm">
          {displaySender?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#1b64f2] uppercase tracking-wider mb-0.5">
          Tin nhắn mới từ
        </p>
        <p className="text-sm font-bold text-slate-900 truncate leading-tight">
          {displaySender}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {content?.length > 60 ? `${content.slice(0, 60)}…` : content}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>

      {/* Progress bar — countdown TOAST_DURATION_MS */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-[#1b64f2]/30 rounded-full"
        style={{
          width:     '100%',
          animation: `toast-shrink ${TOAST_DURATION_MS}ms linear forwards`,
        }}
      />

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
};

export default GlobalChatToastRenderer;
