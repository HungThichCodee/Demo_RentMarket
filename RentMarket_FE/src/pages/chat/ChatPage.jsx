import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalChat } from '../../context/GlobalChatContext';
import { getDisplayName } from '../../utils/chatUtils';
import ChatWindow from '../../components/chat/ChatWindow';
import ConversationList from '../../components/chat/ConversationList';

/**
 * ChatPage — Smart container cho Chat feature.
 *
 * Khi selectedUser thay đổi, gọi setActiveChatUsername() để
 * GlobalChatContext biết conversation nào đang mở.
 * → Đây là cơ chế cốt lõi của "3rd Party Rule":
 *   tin nhắn từ người đang chat sẽ KHÔNG trigger sound/toast.
 */
const ChatPage = () => {
  const { username }                                                          = useAuth();
  const { messages, isConnected, sendMessage, onlineUsers, setActiveChatUsername } = useGlobalChat();

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams]                  = useSearchParams();

  const preSelectUsername = searchParams.get('to');

  // ── Sync active chat username vào GlobalChatContext ────────────────────
  // Mỗi khi selectedUser đổi → cập nhật ref trong Context.
  // Dùng useEffect thay vì gọi trực tiếp trong handler để đảm bảo
  // Context luôn nhận được giá trị mới nhất kể cả khi component re-render.
  useEffect(() => {
    setActiveChatUsername(selectedUser?.username ?? null);
    // Cleanup: khi ChatPage unmount (user rời /chat) → reset về null
    return () => setActiveChatUsername(null);
  }, [selectedUser, setActiveChatUsername]);

  const handleSelectUser = useCallback((user) => setSelectedUser(user), []);
  const handleBack       = useCallback(() => setSelectedUser(null), []);
  const receiverName     = selectedUser ? getDisplayName(selectedUser) : '';

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-6">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1b64f2] text-white shadow-sm">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tin nhắn</h1>
          <p className="text-sm text-slate-400">Lịch sử hội thoại của bạn</p>
        </div>
      </div>

      {/* Layout chính */}
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ── Sidebar: ConversationList ── */}
        <div className={`
          w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white
          ${selectedUser ? 'hidden md:flex' : 'flex'}
        `}>
          <ConversationList
            currentUser={username}
            messages={messages}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onlineUsers={onlineUsers}
            preSelectUsername={preSelectUsername}
          />
        </div>

        {/* ── Chat area ── */}
        <div className={`flex-1 flex flex-col ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
          {selectedUser ? (
            <>
              <button
                onClick={handleBack}
                className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-100 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>

              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatWindow
                  currentUser={username}
                  receiverId={selectedUser.username}
                  receiverName={receiverName}
                  messages={messages}
                  isConnected={isConnected}
                  onlineUsers={onlineUsers}
                  sendMessage={sendMessage}
                />
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
    <div className="w-20 h-20 rounded-full bg-[#1b64f2]/5 flex items-center justify-center">
      <MessageSquare size={36} className="text-[#1b64f2]/30" />
    </div>
    <div className="text-center">
      <p className="text-base font-medium text-slate-500">Chọn một cuộc trò chuyện</p>
      <p className="text-sm text-slate-300 mt-1">Bấm vào tên người dùng bên trái để bắt đầu chat</p>
    </div>
  </div>
);

export default ChatPage;
