package com.rentmarket.chat_service.listener;

import com.rentmarket.chat_service.dto.ChatMessageDto;
import com.rentmarket.chat_service.entity.MessageStatus;
import com.rentmarket.chat_service.service.PresenceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

/**
 * Listener theo dõi sự kiện kết nối/ngắt kết nối WebSocket.
 *
 * Chống "ghost" online status qua 3 tầng:
 * 1. Spring heartbeat tự phát SessionDisconnectEvent khi mất kết nối
 * 2. PresenceService.removeUser() xóa user khỏi ConcurrentHashMap
 * 3. Broadcast OFFLINE tới /topic/public để UI cập nhật
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WebSocketEventListener {

    private static final String SESSION_ATTR_USERNAME = "username";

    PresenceService presenceService;
    SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        String username = (event.getUser() != null) ? event.getUser().getName() : null;
        if (username == null) return;

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        // Lưu username vào session attributes để dùng khi DISCONNECT
        // (SessionDisconnectEvent có thể không có Principal nếu connection đứt giữa chừng)
        if (accessor.getSessionAttributes() != null) {
            accessor.getSessionAttributes().put(SESSION_ATTR_USERNAME, username);
        }

        presenceService.addUser(username);
        broadcastPresence(username, "ONLINE");
        log.info("User '{}' đã KẾT NỐI — Session: {}", username, accessor.getSessionId());
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        // Ưu tiên lấy từ session attributes (đáng tin cậy nhất),
        // fallback sang Principal nếu không có
        String username = extractUsernameFromSession(accessor);
        if (username == null && event.getUser() != null) {
            username = event.getUser().getName();
        }

        if (username == null) {
            log.warn("Session ngắt kết nối nhưng không xác định được user — Session: {}",
                    accessor.getSessionId());
            return;
        }

        presenceService.removeUser(username);
        broadcastPresence(username, "OFFLINE");
        log.info("User '{}' đã NGẮT KẾT NỐI — Session: {}, CloseStatus: {}",
                username, accessor.getSessionId(), event.getCloseStatus());
    }

    private String extractUsernameFromSession(StompHeaderAccessor accessor) {
        if (accessor.getSessionAttributes() == null) return null;
        return (String) accessor.getSessionAttributes().get(SESSION_ATTR_USERNAME);
    }

    private void broadcastPresence(String username, String status) {
        ChatMessageDto presenceMessage = ChatMessageDto.builder()
                .senderId(username)
                .content(status)
                .status(MessageStatus.SENT)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/public", presenceMessage);
    }
}
