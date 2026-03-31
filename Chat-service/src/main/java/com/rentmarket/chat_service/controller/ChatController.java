package com.rentmarket.chat_service.controller;

import com.rentmarket.chat_service.dto.ChatMessageDto;
import com.rentmarket.chat_service.service.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

/**
 * Controller xử lý tin nhắn chat — kết hợp WebSocket STOMP và REST API.
 *
 * WebSocket: Client gửi → /app/chat.sendMessage → server lưu DB + đẩy tới receiver
 * REST API:  GET /chat/history/{user1}/{user2} → lấy lịch sử tin nhắn
 */
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatController {

    SimpMessagingTemplate messagingTemplate;
    ChatService chatService;

    /**
     * Xử lý tin nhắn chat real-time qua STOMP WebSocket.
     *
     * Luồng: nhận DTO → ghi đè senderId bằng JWT Principal (chống giả mạo)
     *       → lưu DB → gửi tới receiver + sender confirmation.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto, Principal principal) {
        // Chống giả mạo: server chỉ tin Principal từ JWT, bỏ qua senderId của client
        String authenticatedUser = principal.getName();
        chatMessageDto.setSenderId(authenticatedUser);

        ChatMessageDto savedMessage = chatService.saveMessage(chatMessageDto);

        // Gửi tới receiver: /user/{receiverId}/queue/messages
        messagingTemplate.convertAndSendToUser(
                chatMessageDto.getReceiverId(), "/queue/messages", savedMessage);

        // Gửi xác nhận ngược lại cho sender (UI cập nhật id + timestamp từ server)
        messagingTemplate.convertAndSendToUser(
                authenticatedUser, "/queue/messages", savedMessage);

        log.info("Chat: '{}' → '{}' (id: {})",
                authenticatedUser, chatMessageDto.getReceiverId(), savedMessage.getId());
    }

    /**
     * REST API: Lấy lịch sử chat giữa 2 người dùng.
     * Trả về tin nhắn cả 2 chiều, sắp xếp theo thời gian tăng dần.
     */
    @GetMapping("/chat/history/{user1}/{user2}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable String user1,
            @PathVariable String user2) {

        return ResponseEntity.ok(chatService.getChatHistory(user1, user2));
    }
}
