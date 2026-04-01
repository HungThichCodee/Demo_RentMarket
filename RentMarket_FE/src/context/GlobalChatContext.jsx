import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { getCurrentUsername } from '../utils/chatUtils';

// ── Constants ──────────────────────────────────────────────────────────────
const WS_BASE            = (import.meta.env.VITE_WS_DOMAIN || 'wss://api.codespheree.id.vn').replace(/\/$/, '');
const WS_URL             = `${WS_BASE}/chat/ws`;
const RECONNECT_DELAY_MS = 5_000;
const HEARTBEAT_MS       = 20_000;

// ── Context ────────────────────────────────────────────────────────────────
const GlobalChatContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────
/**
 * GlobalChatProvider — Singleton STOMP connection cho toàn bộ app.
 *
 * ═══════════════════════════════════════════════════════════════
 * LUỒNG THÔNG BÁO KHI CÓ TIN NHẮN MỚI (3RD PARTY RULE)
 * ═══════════════════════════════════════════════════════════════
 *
 * Khi tin nhắn đến qua STOMP:
 *
 *   1. Dedup → thêm vào messages[] (sidebar tự cập nhật)
 *   2. Bỏ qua nếu là echo của chính mình (senderId === me)
 *   3. Kiểm tra điều kiện KHÔNG báo:
 *
 *      isOnChatPage = pathname === '/chat'
 *      activeChatUser = người đang được chọn trong ChatPage (qua activeChatUsernameRef)
 *      isViewingThisSender = isOnChatPage && activeChatUser === msg.senderId
 *
 *      → Nếu isViewingThisSender: KHÔNG badge, KHÔNG sound, KHÔNG toast
 *      → Nếu không: badge++, play sound, hiện toast (chỉ khi rời khỏi /chat)
 *
 * ═══════════════════════════════════════════════════════════════
 * TẠI SAO CẦN activeChatUsernameRef?
 * ═══════════════════════════════════════════════════════════════
 *
 * Trước đây chỉ dùng URL query ?to=<username> để biết user đang chat với ai.
 * Nhưng khi click từ ConversationList sidebar → selectedUser thay đổi nhưng
 * URL KHÔNG cập nhật → chatTo từ URLSearchParams luôn là null → isViewing = false
 * → Toast/sound vẫn bị trigger dù đang xem đúng conversation.
 *
 * Fix: ChatPage gọi setActiveChatUsername(user.username) mỗi khi selectedUser thay đổi.
 * GlobalChatContext lưu vào ref → STOMP callback đọc được real-time value.
 *
 * ═══════════════════════════════════════════════════════════════
 * ONLINE USERS — Set<string>
 * ═══════════════════════════════════════════════════════════════
 * Set<string> để O(1) lookup thay vì Array.includes() O(N).
 */
export const GlobalChatProvider = ({ children }) => {
  const location = useLocation();

  const [messages,    setMessages]    = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastQueue,  setToastQueue]  = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set()); // Set<string>

  const msgSubRef               = useRef(null);
  const presenceSubRef          = useRef(null);
  const stompClientRef          = useRef(null);
  const locationRef             = useRef(location);
  
  // State để track theo dõi sự thay đổi user login/logout
  const [currentUser, setCurrentUser] = useState(getCurrentUsername());
  // ↓ Username của người đang được chọn trong ChatPage.
  //   Được set bởi ChatPage thông qua setActiveChatUsername().
  //   Dùng ref (không phải state) để STOMP callback luôn đọc được giá trị mới nhất
  //   mà không cần re-subscribe.
  const activeChatUsernameRef   = useRef(null);

  useEffect(() => { locationRef.current = location; }, [location]);

  // Cập nhật lại currentUser mỗi khi chuyển trang (login, logout sẽ làm thay đổi token)
  useEffect(() => {
    const freshUser = getCurrentUsername();
    if (freshUser !== currentUser) {
      setCurrentUser(freshUser);
    }
  }, [location.pathname, currentUser]);

  // ── WebSocket singleton & auto-reconnect khi user đổi ──────────────────
  useEffect(() => {
    if (!currentUser) {
      // Đã đăng xuất -> Ngắt Stomp ngay lập tức
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      brokerURL:         WS_URL,
      connectHeaders:    { Authorization: `Bearer ${token}` },
      reconnectDelay:    RECONNECT_DELAY_MS,
      heartbeatIncoming: HEARTBEAT_MS,
      heartbeatOutgoing: HEARTBEAT_MS,
      debug:             import.meta.env.DEV ? (msg) => console.debug('[STOMP]', msg) : () => {},

      onConnect: () => {
        setIsConnected(true);

        // Xóa subscription cũ nếu có để chống Duplicate Triggers (Memory Leak)
        if (msgSubRef.current) msgSubRef.current.unsubscribe();
        if (presenceSubRef.current) presenceSubRef.current.unsubscribe();

        // ── Tin nhắn cá nhân ──────────────────────────────────────────
        msgSubRef.current = client.subscribe('/user/queue/messages', (frame) => {
          const msg = JSON.parse(frame.body);
          const me  = currentUser;

          // 1. Dedup: server echo tin về cả sender lẫn receiver
          setMessages((prev) => {
            if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // 2. Echo của chính mình → bỏ qua notification
          const safeMe     = String(me || '').toLowerCase();
          const safeSender = String(msg.senderId || '').toLowerCase();
          if (safeSender === safeMe) return;

          // ══════════════════════════════════════════════════════════
          // 3RD PARTY RULE — Kiểm tra "đang xem đúng conversation?"
          //
          // isOnChatPage:      user đang ở trang /chat
          // activeChatUser:    username đang được chọn trong ChatPage
          //                    (được ChatPage set mỗi khi selectedUser đổi)
          // isViewingThisSender: đang mở đúng conversation với sender này
          //
          // Nếu isViewingThisSender = true → TIN NHẮN ĐÃ HIỂN THỊ TRỰC TIẾP
          // trong ChatWindow rồi, KHÔNG cần badge/sound/toast thêm.
          //
          // Nếu isViewingThisSender = false (user ở trang khác, hoặc đang
          // chat với người khác trên /chat) → BÁO ĐẦY ĐỦ.
          // ══════════════════════════════════════════════════════════
          const isOnChatPage        = locationRef.current.pathname === '/chat';
          const activeChatUser      = String(activeChatUsernameRef.current || '').toLowerCase();
          const isViewingThisSender = isOnChatPage && activeChatUser === safeSender;

          if (isViewingThisSender) return;

          // ── Cập nhật badge ─────────────────────────────────────────
          setUnreadCount((n) => n + 1);

          // ── Âm thanh thông báo ─────────────────────────────────────
          // Dùng .catch() thay vì try/catch vì audio.play() trả về Promise.
          // Browser chặn autoplay nếu user chưa tương tác với trang —
          // .catch() bắt lỗi im lặng, không crash app, không spam console.
          const audio = new Audio('/sounds/thongBao.mp3');
          audio.play().catch((e) => console.warn('[Audio] Autoplay prevented:', e.message));

          // ── Toast (chỉ khi KHÔNG ở /chat) ─────────────────────────
          // Khi user đang ở /chat nhưng đang xem conversation KHÁC,
          // badge đã đủ để thông báo — không cần toast spam thêm.
          if (!isOnChatPage) {
            setToastQueue((q) => [
              // Cap queue ở 10 items — tránh memory leak khi user offline lâu
              ...q.slice(-9),
              {
                id:         msg.id ?? crypto.randomUUID(), // Dùng UUID chuẩn tránh trùng lặp
                senderId:   msg.senderId,
                senderName: msg.senderName || msg.senderId, // Lấy tực tiếp từ Payload
                content:    msg.content,
              },
            ]);
          }
        });

        // ── Presence broadcast ────────────────────────────────────────
        presenceSubRef.current = client.subscribe('/topic/public', (frame) => {
          const { senderId, content } = JSON.parse(frame.body);
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            if (content === 'ONLINE')  next.add(senderId);
            if (content === 'OFFLINE') next.delete(senderId);
            return next;
          });
        });
      },

      onDisconnect:     () => setIsConnected(false),
      onStompError:     () => setIsConnected(false),
      onWebSocketError: () => setIsConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (msgSubRef.current) msgSubRef.current.unsubscribe();
      if (presenceSubRef.current) presenceSubRef.current.unsubscribe();
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [currentUser]); // Chạy lại hàm này TỨC THÌ khi currentUser thay đổi (Login Account B)

  // Reset unread khi user vào /chat
  useEffect(() => {
    if (location.pathname === '/chat') setUnreadCount(0);
  }, [location.pathname]);

  // ── Public API ─────────────────────────────────────────────────────────
  const sendMessage = useCallback((receiverId, content) => {
    const client = stompClientRef.current;
    if (!client?.active) return;
    client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({ receiverId, content }),
    });
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToastQueue((q) => q.filter((t) => t.id !== toastId));
  }, []);

  /**
   * Được gọi bởi ChatPage mỗi khi selectedUser thay đổi.
   * Dùng ref → không gây re-render, STOMP callback đọc được ngay.
   */
  const setActiveChatUsername = useCallback((username) => {
    activeChatUsernameRef.current = username ?? null;
  }, []);

  return (
    <GlobalChatContext.Provider value={{
      messages,
      setMessages,
      onlineUsers,           // Set<string> — dùng onlineUsers.has(username)
      isConnected,
      sendMessage,
      unreadCount,
      toastQueue,
      dismissToast,
      setActiveChatUsername, // ChatPage phải gọi khi selectedUser đổi
    }}>
      {children}
    </GlobalChatContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useGlobalChat = () => {
  const ctx = useContext(GlobalChatContext);
  if (!ctx) throw new Error('useGlobalChat phải được dùng bên trong <GlobalChatProvider>');
  return ctx;
};
