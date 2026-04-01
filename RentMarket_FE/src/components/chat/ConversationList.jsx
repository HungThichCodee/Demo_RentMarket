import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { getMyConversations, markConversationAsRead } from '../../services/chatService';
import { getDisplayName, getInitial, formatTimestamp } from '../../utils/chatUtils';

/**
 * ConversationList — Sidebar inbox (danh sách hội thoại gần đây).
 *
 * Nguồn dữ liệu 2 lớp:
 *   1. REST API (seed): GET /chat/conversations/me → load 1 lần khi mount
 *   2. STOMP stream (prop `messages`)             → merge real-time, không gọi lại API
 *
 * Khi có ?to=<username> (điều hướng từ trang khác):
 *   - Nếu partner đã có trong conversations → tự động chọn
 *   - Nếu chưa có → tạo stub entry để ChatWindow mở được ngay
 *
 * Props:
 *   currentUser       — username đang đăng nhập
 *   messages          — ChatMessage[] từ STOMP (GlobalChatContext)
 *   selectedUser      — User | null
 *   onSelectUser      — (user) => void
 *   onlineUsers       — Set<string>
 *   preSelectUsername — string | null (từ ?to= query param)
 */
const ConversationList = ({
  currentUser,
  messages     = [],
  selectedUser,
  onSelectUser,
  onlineUsers,
  preSelectUsername,
}) => {
  const [apiConversations, setApiConversations] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [localReadSet,     setLocalReadSet]      = useState(() => new Set());
  // Ref guard: chỉ auto-select 1 lần cho mỗi giá trị preSelectUsername
  const autoSelectedRef = useRef(null);

  // ── Load inbox từ API ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    getMyConversations()
      .then((data)  => { if (!cancelled) setApiConversations(data ?? []); })
      .catch(()     => { /* lỗi network — hiển thị empty state, không crash */ })
      .finally(()   => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [currentUser]);

  // ── Merge API + STOMP stream → conversations ──────────────────────────
  const conversations = useMemo(() => {
    const convMap = new Map(
      apiConversations.map((c) => [c.partnerUsername, { ...c }]),
    );

    for (const msg of messages) {
      const safeSender      = String(msg.senderId || '').toLowerCase();
      const safeReceiver    = String(msg.receiverId || '').toLowerCase();
      const safeCurrentUser = String(currentUser || '').toLowerCase();

      // Fix "Chat Partner" Identification
      const isFromMe = safeSender === safeCurrentUser;
      const partner  = isFromMe ? msg.receiverId : msg.senderId;
      
      if (!partner || String(partner).toLowerCase() === safeCurrentUser) continue;

      const msgTime      = msg.timestamp ? new Date(msg.timestamp) : new Date(0);
      const existing     = convMap.get(partner);
      const existingTime = existing?.lastTimestamp ? new Date(existing.lastTimestamp) : new Date(0);

      if (!existing || msgTime > existingTime) {
        const prevUnread = existing?.unreadCount ?? 0;
        convMap.set(partner, {
          partnerUsername: partner,
          lastContent:     msg.content,
          lastTimestamp:   msg.timestamp,
          isLastFromMe:    isFromMe,
          unreadCount:
            !isFromMe && selectedUser?.username !== partner
              ? prevUnread + 1
              : prevUnread,
        });
      }
    }

    // Optimistic read reset
    for (const partner of localReadSet) {
      const entry = convMap.get(partner);
      if (entry) entry.unreadCount = 0;
    }

    return Array.from(convMap.values()).sort((a, b) => {
      const tA = a.lastTimestamp ? new Date(a.lastTimestamp) : new Date(0);
      const tB = b.lastTimestamp ? new Date(b.lastTimestamp) : new Date(0);
      return tB - tA;
    });
  }, [apiConversations, messages, currentUser, selectedUser, localReadSet]);

  // ── Auto-select từ ?to= param ─────────────────────────────────────────
  // Dùng ref guard — chỉ gọi onSelectUser 1 lần mỗi giá trị preSelectUsername.
  // Tránh re-run vô tận do selectedUser thay đổi khi onSelectUser được gọi.
  useEffect(() => {
    if (!preSelectUsername || loading) return;
    if (autoSelectedRef.current === preSelectUsername) return; // Đã auto-select rồi

    autoSelectedRef.current = preSelectUsername;
    onSelectUser({ username: preSelectUsername });
  }, [preSelectUsername, loading, onSelectUser]);

  // Reset ref khi preSelectUsername thay đổi sang giá trị mới
  useEffect(() => {
    if (autoSelectedRef.current !== preSelectUsername) {
      autoSelectedRef.current = null;
    }
  }, [preSelectUsername]);

  // ── Click handler ─────────────────────────────────────────────────────
  const handleSelect = useCallback((partnerUsername) => {
    onSelectUser({ username: partnerUsername });
    setLocalReadSet((prev) => new Set([...prev, partnerUsername]));
    markConversationAsRead(partnerUsername); // fire & forget
  }, [onSelectUser]);

  // ── Header của sidebar ────────────────────────────────────────────────
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Hội thoại</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? '...' : `${conversations.length} cuộc trò chuyện`}
          </p>
        </div>
        {totalUnread > 0 && (
          <span className="min-w-[22px] h-[22px] rounded-full bg-[#1b64f2] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-[#1b64f2]/40" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1b64f2]/5 flex items-center justify-center">
              <MessageSquare size={24} className="text-[#1b64f2]/30" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Chưa có hội thoại nào</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vào chi tiết đơn hàng để bắt đầu<br />trò chuyện với người bán / admin
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.partnerUsername}
              conv={conv}
              isActive={selectedUser?.username === conv.partnerUsername}
              isOnline={onlineUsers?.has(conv.partnerUsername) ?? false}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ── ConversationItem ───────────────────────────────────────────────────────
const ConversationItem = memo(({ conv, isActive, isOnline, onSelect }) => {
  const { partnerUsername, lastContent, lastTimestamp, unreadCount, isLastFromMe } = conv;

  const isUnread    = (unreadCount ?? 0) > 0 && !isActive;
  const userStub    = { username: partnerUsername };
  const displayName = getDisplayName(userStub);
  const initial     = getInitial(userStub);
  const snippet     = lastContent
    ? isLastFromMe ? `Bạn: ${lastContent}` : lastContent
    : '';

  const handleClick = useCallback(() => onSelect(partnerUsername), [onSelect, partnerUsername]);

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 text-left
        transition-all duration-150 cursor-pointer relative border-r-2
        ${isActive ? 'bg-[#1b64f2]/5 border-[#1b64f2]' : 'hover:bg-slate-50 border-transparent'}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`
          w-11 h-11 rounded-full flex items-center justify-center
          font-bold text-sm transition-all duration-200
          ${isActive
            ? 'bg-[#1b64f2] text-white shadow-md shadow-[#1b64f2]/20'
            : 'bg-[#1b64f2]/10 text-[#1b64f2]'}
        `}>
          {initial}
        </div>
        <span className={`
          absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
          border-2 border-white transition-colors duration-300
          ${isOnline ? 'bg-emerald-400' : 'bg-slate-200'}
        `} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className={`text-sm truncate ${
            isActive  ? 'text-[#1b64f2] font-bold' :
            isUnread  ? 'text-slate-900 font-bold' :
                        'text-slate-700 font-semibold'
          }`}>
            {displayName}
          </p>
          <span className={`text-[10px] flex-shrink-0 tabular-nums ${
            isUnread ? 'text-[#1b64f2] font-semibold' : 'text-slate-400'
          }`}>
            {formatTimestamp(lastTimestamp)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <p className={`text-xs truncate leading-relaxed flex-1 min-w-0 ${
            isUnread ? 'text-slate-700 font-medium' : 'text-slate-400'
          }`}>
            {snippet || <span className="italic text-slate-300">Chưa có tin nhắn</span>}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#1b64f2] text-white text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

ConversationItem.displayName = 'ConversationItem';

export default ConversationList;
