import { useEffect, useRef, useMemo } from 'react';
import { MessageCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { getChatHistory } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useState } from 'react';

/**
 * Smart container — kết hợp WebSocket real-time + REST history.
 *
 * WebSocket được quản lý bởi ChatPage (parent), không tạo mới ở đây.
 * Khi người dùng chuyển cuộc trò chuyện, component này re-render với
 * receiverId mới mà KHÔNG ngắt/kết nối lại WebSocket.
 *
 * Props:
 *   - currentUser: username của người dùng hiện tại
 *   - receiverId: username người đang chat cùng
 *   - receiverName: tên hiển thị
 *   - messages: mảng tin nhắn real-time từ useChat (ChatPage quản lý)
 *   - isConnected: trạng thái kết nối WebSocket
 *   - onlineUsers: danh sách username đang online
 *   - sendMessage: hàm gửi tin qua WebSocket
 *   - setMessages: dùng để clear tin khi cần (optional)
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
  const messagesEndRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isReceiverOnline = onlineUsers.includes(receiverId);

  // Load lịch sử chat khi mở cuộc hội thoại mới
  useEffect(() => {
    if (!currentUser || !receiverId) return;

    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistory([]); // xóa history cũ ngay khi chuyển conversation
      try {
        const data = await getChatHistory(currentUser, receiverId);
        if (!cancelled) setHistory(data || []);
      } catch (err) {
        console.error('Không thể tải lịch sử chat:', err);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => { cancelled = true; }; // chống race condition
  }, [currentUser, receiverId]);

  // Memoize: lọc tin nhắn real-time thuộc cuộc hội thoại hiện tại
  const realtimeMessages = useMemo(
    () =>
      messages.filter(
        (msg) =>
          (msg.senderId === currentUser && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === currentUser)
      ),
    [messages, currentUser, receiverId]
  );

  // Memoize: gộp history + real-time, loại bỏ duplicate bằng id
  const allMessages = useMemo(() => {
    const historyIds = new Set(history.map((m) => m.id));
    const uniqueRealtime = realtimeMessages.filter((m) => !historyIds.has(m.id));
    return [...history, ...uniqueRealtime];
  }, [history, realtimeMessages]);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">
                {(receiverName || receiverId)?.charAt(0)?.toUpperCase()}
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
              {receiverName || receiverId}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isReceiverOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </p>
          </div>
        </div>

        <div
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-300
            ${isConnected
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-500'
            }
          `}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
        </div>
      </div>

      {/* ═══════════ MESSAGE LIST ═══════════ */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-surface">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <MessageCircle size={28} className="text-primary/40" />
            </div>
            <p className="text-sm font-medium">Chưa có tin nhắn</p>
            <p className="text-xs text-slate-300">
              Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
            </p>
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble
              key={msg.id || `${msg.senderId}-${msg.timestamp}`}
              message={msg}
              isMine={msg.senderId === currentUser}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ═══════════ INPUT ═══════════ */}
      <ChatInput onSend={(content) => sendMessage(receiverId, content)} disabled={!isConnected} />
    </div>
  );
};

export default ChatWindow;
