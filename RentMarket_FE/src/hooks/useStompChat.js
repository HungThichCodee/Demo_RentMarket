import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

/**
 * Custom hook quản lý kết nối WebSocket STOMP tới Chat-service.
 *
 * WebSocket URL: wss://api.codespheree.id.vn/chat/ws (qua API Gateway + Cloudflare Tunnel)
 * JWT được gửi trong STOMP CONNECT frame header (không phải HTTP header).
 */

// Trim trailing slash để tránh double-slash khi concat path
const WS_BASE = (import.meta.env.VITE_WS_DOMAIN || 'wss://api.codespheree.id.vn').replace(/\/$/, '');
const WS_URL = `${WS_BASE}/chat/ws`;

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('[useChat] Đang kết nối tới WebSocket:', WS_URL);

    const client = new Client({
      brokerURL: WS_URL,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Reconnect sau 5 giây nếu mất kết nối
      reconnectDelay: 5000,

      // Cloudflare Tunnel timeout = 100s idle
      // Heartbeat 20s đảm bảo connection không bị Cloudflare đóng
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,

      onConnect: (frame) => {
        console.log('[useChat] STOMP kết nối thành công:', frame.headers);
        setIsConnected(true);

        // Subscribe nhận tin nhắn cá nhân
        client.subscribe('/user/queue/messages', (message) => {
          const chatMessage = JSON.parse(message.body);
          setMessages((prev) => {
            // Dedup: server gửi echo về cho sender, tránh hiện 2 lần
            if (chatMessage.id && prev.some((m) => m.id === chatMessage.id)) return prev;
            return [...prev, chatMessage];
          });
        });

        // Subscribe nhận trạng thái online/offline broadcast
        client.subscribe('/topic/public', (message) => {
          const { senderId, content } = JSON.parse(message.body);

          setOnlineUsers((prev) => {
            if (content === 'ONLINE') {
              return prev.includes(senderId) ? prev : [...prev, senderId];
            }
            if (content === 'OFFLINE') {
              return prev.filter((u) => u !== senderId);
            }
            return prev;
          });
        });
      },

      onDisconnect: () => {
        console.log('[useChat] STOMP đã ngắt kết nối');
        setIsConnected(false);
      },

      onStompError: (frame) => {
        console.error('[useChat] STOMP error:', frame.headers?.message, frame.body);
        setIsConnected(false);
      },

      onWebSocketError: (event) => {
        console.error('[useChat] WebSocket error - URL đang dùng:', WS_URL, event);
        setIsConnected(false);
      },

      // Tắt log spam của STOMP lib trong console
      debug: (msg) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      console.log('[useChat] Dọn dẹp kết nối WebSocket');
      if (client.active) {
        client.deactivate();
      }
      stompClientRef.current = null;
    };
  }, []); // Chỉ chạy 1 lần khi mount

  const sendMessage = useCallback((receiverId, content) => {
    const client = stompClientRef.current;
    if (!client || !client.active) {
      console.warn('[useChat] Chưa kết nối — không thể gửi');
      return;
    }

    client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({ receiverId, content }),
    });
  }, []);

  return { messages, isConnected, sendMessage, onlineUsers, setMessages };
};

export default useChat;
