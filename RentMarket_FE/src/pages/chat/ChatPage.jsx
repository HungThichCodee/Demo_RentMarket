import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Search, Users, ArrowLeft } from 'lucide-react';
import { getAllUsers } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import useChat from '../../hooks/useStompChat';
import ChatWindow from '../../components/chat/ChatWindow';

/**
 * Trang Chat chính — sidebar danh sách user + ChatWindow.
 *
 * useChat được khởi tạo tại đây (KHÔNG trong ChatWindow) để:
 * - WebSocket chỉ kết nối 1 lần khi vào trang chat
 * - Chuyển cuộc trò chuyện KHÔNG gây reconnect
 * - Cùng 1 stream messages được filter theo từng cuộc trò chuyện
 *
 * Route: /chat
 */
const ChatPage = () => {
  const { username } = useAuth();

  // ── WebSocket ở đây, sống suốt vòng đời của ChatPage ──────────────
  const { messages, isConnected, sendMessage, onlineUsers, setMessages } = useChat();

  // ── Danh sách users ───────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        const otherUsers = (data.result || []).filter((u) => u.username !== username);
        setUsers(otherUsers);
      } catch (err) {
        console.error('Không thể tải danh sách user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [username]);

  // useMemo thay cho useEffect + state riêng — đơn giản hơn, ít re-render hơn
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  const getDisplayName = (user) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-6">
      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tin nhắn</h1>
          <p className="text-sm text-slate-400">Chat trực tiếp với người dùng khác</p>
        </div>
      </div>

      {/* Main container */}
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">

        {/* ═══════════ SIDEBAR — Danh sách users ═══════════ */}
        <div
          className={`
            w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white
            ${selectedUser ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Search bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-surface border border-gray-200 rounded-xl
                  text-sm text-slate-800 placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  transition-all
                "
              />
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Users size={32} className="text-slate-300" />
                <p className="text-sm">Không tìm thấy người dùng</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const displayName = getDisplayName(user);
                const isActive = selectedUser?.username === user.username;
                const isOnline = onlineUsers.includes(user.username);

                return (
                  <button
                    key={user.id || user.username}
                    onClick={() => setSelectedUser(user)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5
                      text-left transition-all duration-150 cursor-pointer
                      ${isActive
                        ? 'bg-primary/5 border-r-2 border-primary'
                        : 'hover:bg-slate-50'
                      }
                    `}
                  >
                    {/* Avatar với online dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span
                        className={`
                          absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
                          border-2 border-white transition-colors duration-300
                          ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}
                        `}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-primary' : 'text-slate-900'
                        }`}
                      >
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════════ MAIN — Chat window ═══════════ */}
        <div
          className={`
            flex-1 flex flex-col
            ${selectedUser ? 'flex' : 'hidden md:flex'}
          `}
        >
          {selectedUser ? (
            <>
              {/* Mobile back button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-100 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>

              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatWindow
                  currentUser={username}
                  receiverId={selectedUser.username}
                  receiverName={getDisplayName(selectedUser)}
                  messages={messages}
                  isConnected={isConnected}
                  onlineUsers={onlineUsers}
                  sendMessage={sendMessage}
                  setMessages={setMessages}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                <MessageSquare size={36} className="text-primary/30" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-slate-500">
                  Chọn một cuộc trò chuyện
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  Chọn người dùng từ danh sách bên trái để bắt đầu chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
