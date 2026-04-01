import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MessageCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { getChatHistory } from '../../services/chatService';
import api from '../../services/api';
import { getDisplayName } from '../../utils/chatUtils';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

/**
 * ChatWindow — Smart container cho một cuộc hội thoại.
 *
 * Kết hợp lịch sử từ REST API với real-time stream từ GlobalChatContext.
 * WebSocket KHÔNG được khởi tạo ở đây — chỉ nhận props từ ChatPage.
 *
 * Props:
 *   currentUser  — username đang đăng nhập
 *   receiverId   — username người đang chat cùng
 *   receiverName — tên hiển thị của receiver
 *   messages     — ChatMessage[] từ STOMP (GlobalChatContext)
 *   isConnected  — trạng thái WebSocket
 *   onlineUsers  — Set<string>
 *   sendMessage  — (receiverId, content) => void
 */
const ChatWindow = ({
  currentUser,
  receiverId,
  receiverName,
  messages,
  isConnected,
  onlineUsers,
  sendMessage,
}) => {
  const messagesEndRef  = useRef(null);
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [fetchedReceiverName, setFetchedReceiverName] = useState('');

  // onlineUsers là Set<string> → O(1)
  const isReceiverOnline = onlineUsers.has(receiverId);

  // ── Auto fetch receiver name nếu bị thiếu họ tên ──────────────────────────
  useEffect(() => {
    setFetchedReceiverName('');
    
    // Nếu receiverName bằng đúng receiverId (vd: chỉ có mỗi username 'admin')
    // thì gọi API sang Identity-service để lấy đầy đủ tên.
    if (receiverId && (!receiverName || receiverName === receiverId)) {
      api.get(`/identity/users/by-username/${receiverId}`)
        .then((res) => {
          if (res.data?.result) {
            setFetchedReceiverName(getDisplayName(res.data.result));
          }
        })
        .catch(() => { /* im lặng nếu lỗi, fallback về username */ });
    }
  }, [receiverId, receiverName]);

  const displayReceiverName = fetchedReceiverName || receiverName || receiverId;

  // ── Load lịch sử khi chuyển conversation ──────────────────────────────
  useEffect(() => {
    if (!currentUser || !receiverId) return;
    let cancelled = false;

    setHistory([]);          // xóa history cũ ngay lập tức
    setHistoryLoading(true);

    getChatHistory(currentUser, receiverId)
      .then((data) => { if (!cancelled) setHistory(data ?? []); })
      .catch(() => { /* lỗi network — không crash, chỉ để history rỗng */ })
      .finally(() => { if (!cancelled) setHistoryLoading(false); });

    return () => { cancelled = true; };
  }, [currentUser, receiverId]);

  // ── Lọc tin real-time thuộc conversation này ───────────────────────────
  const realtimeMessages = useMemo(
    () => messages.filter(
      (msg) => {
        const sId = String(msg.senderId || '').toLowerCase();
        const rId = String(msg.receiverId || '').toLowerCase();
        const cId = String(currentUser || '').toLowerCase();
        const partner = String(receiverId || '').toLowerCase();
        
        return (sId === cId && rId === partner) || (sId === partner && rId === cId);
      }
    ),
    [messages, currentUser, receiverId],
  );

  // ── Merge history + realtime, dedup bằng id ───────────────────────────
  const allMessages = useMemo(() => {
    const historyIds = new Set(history.map((m) => m.id));
    return [...history, ...realtimeMessages.filter((m) => !historyIds.has(m.id))];
  }, [history, realtimeMessages]);

  // ── Auto-scroll khi có tin mới ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // ── Handler gửi tin (useCallback — tránh ChatInput re-render) ──────────
  const handleSend = useCallback(
    (content) => sendMessage(receiverId, content),
    [sendMessage, receiverId],
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#1b64f2]/10 flex items-center justify-center">
              <span className="text-[#1b64f2] font-bold text-sm">
                {displayReceiverName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span
              className={`
                absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                border-2 border-white transition-colors duration-300
                ${isReceiverOnline ? 'bg-emerald-400' : 'bg-slate-300'}
              `}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {displayReceiverName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isReceiverOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </p>
          </div>
        </div>

        {/* Connection status badge */}
        <div
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-300
            ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}
          `}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#f8f9fa]">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-[#1b64f2]/50" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#1b64f2]/5 flex items-center justify-center">
              <MessageCircle size={28} className="text-[#1b64f2]/40" />
            </div>
            <p className="text-sm font-medium">Chưa có tin nhắn</p>
            <p className="text-xs text-slate-300">Gửi tin nhắn đầu tiên để bắt đầu</p>
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble
              key={msg.id ?? `${msg.senderId}-${msg.timestamp}`}
              message={msg}
              isMine={String(msg.senderId || '').toLowerCase() === String(currentUser || '').toLowerCase()}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </div>
  );
};

export default ChatWindow;
