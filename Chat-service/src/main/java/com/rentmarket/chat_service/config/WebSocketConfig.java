package com.rentmarket.chat_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket + STOMP cho Chat-service.
 *
 * Luồng hoạt động tổng thể:
 * 1. Client kết nối WebSocket tại endpoint: ws://localhost:8888/chat/ws (qua API Gateway)
 * 2. Client gửi tin nhắn tới destination có prefix "/app" (ví dụ: /app/chat.sendMessage)
 * 3. Server xử lý tin nhắn trong @MessageMapping controller
 * 4. Server đẩy tin nhắn tới người nhận qua broker "/queue" (point-to-point) hoặc "/topic" (broadcast)
 *
 * Lưu ý quan trọng:
 * - CORS đã được API Gateway xử lý, nên ở đây set allowedOriginPatterns("*")
 * - JWT được xác thực tại tầng ChannelInterceptor (JwtChannelInterceptor), KHÔNG phải HTTP filter
 *   vì WebSocket STOMP truyền token trong CONNECT frame header, không phải HTTP header
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;

    /**
     * Cấu hình Message Broker:
     *
     * - enableSimpleBroker("/topic", "/queue"):
     *   + "/topic" → dùng cho broadcast (ví dụ: thông báo online status cho tất cả)
     *   + "/queue" → dùng cho point-to-point (tin nhắn riêng giữa 2 người)
     *     Khi dùng convertAndSendToUser(), Spring tự động thêm prefix "/user/{userId}/queue/..."
     *
     * - setApplicationDestinationPrefixes("/app"):
     *   Tất cả tin nhắn client gửi lên phải có prefix "/app"
     *   Ví dụ: client gửi tới "/app/chat.sendMessage" → server nhận tại @MessageMapping("/chat.sendMessage")
     *
     * - setUserDestinationPrefix("/user"):
     *   Prefix cho destination riêng của từng user
     *   Client subscribe tới "/user/queue/messages" để nhận tin nhắn cá nhân
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Kích hoạt simple broker cho 2 loại destination
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix cho tin nhắn từ client → server
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix cho tin nhắn riêng của từng user (dùng với convertAndSendToUser)
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Đăng ký STOMP endpoint để client kết nối WebSocket.
     *
     * - addEndpoint("/chat/ws"):
     *   URL kết nối: ws://localhost:8084/chat/ws (trực tiếp) hoặc ws://localhost:8888/chat/ws (qua Gateway)
     *   Path "/chat" khớp với route đã cấu hình trong API Gateway: Path=/chat/**
     *
     * - setAllowedOriginPatterns("*"):
     *   Cho phép mọi origin kết nối. CORS chính thức được kiểm soát bởi API Gateway.
     *
     * - withSockJS():
     *   Hỗ trợ fallback cho trình duyệt cũ không hỗ trợ WebSocket thuần.
     *   Client có thể dùng SockJS library để tự động chuyển sang HTTP long-polling nếu cần.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat/ws")
                .setAllowedOriginPatterns("*");  // CORS do Gateway quản lý
    }

    /**
     * Đăng ký ChannelInterceptor vào inbound channel.
     *
     * Mọi STOMP frame (CONNECT, SEND, SUBSCRIBE,...) đều đi qua inbound channel.
     * JwtChannelInterceptor sẽ chặn frame CONNECT để:
     * 1. Trích xuất JWT token từ header "Authorization"
     * 2. Xác thực token (verify chữ ký HS512 + kiểm tra hết hạn)
     * 3. Gán Principal (danh tính user) vào session WebSocket
     *
     * Nếu token không hợp lệ → từ chối kết nối ngay lập tức.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}
