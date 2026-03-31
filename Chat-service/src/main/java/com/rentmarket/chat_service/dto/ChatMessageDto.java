package com.rentmarket.chat_service.dto;

import com.rentmarket.chat_service.entity.MessageStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * DTO dùng để truyền dữ liệu tin nhắn qua WebSocket và REST API.
 *
 * Tách biệt khỏi Entity để:
 * 1. Không expose trực tiếp cấu trúc DB ra ngoài.
 * 2. Client chỉ gửi lên (senderId, receiverId, content) → server tự gán timestamp + status.
 * 3. Khi trả về client, DTO chứa đầy đủ thông tin bao gồm id, timestamp, status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageDto {

    /** ID tin nhắn (chỉ có khi trả về từ server, client không cần gửi lên) */
    String id;

    /** ID người gửi */
    String senderId;

    /** ID người nhận */
    String receiverId;

    /** Nội dung tin nhắn */
    String content;

    /** Thời điểm gửi (server tự gán, client không cần gửi lên) */
    LocalDateTime timestamp;

    /** Trạng thái tin nhắn (server tự gán, client không cần gửi lên) */
    MessageStatus status;
}
