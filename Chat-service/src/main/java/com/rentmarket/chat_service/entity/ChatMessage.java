package com.rentmarket.chat_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho một tin nhắn chat giữa 2 người dùng.
 * - senderId / receiverId: username của người gửi và người nhận.
 * - status: vòng đời SENT → DELIVERED → READ.
 * - timestamp: do ChatService gán tại tầng service, đảm bảo tính nhất quán.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "chat_messages", indexes = {
        // Index composite giúp truy vấn lịch sử chat giữa 2 user nhanh hơn
        @Index(name = "idx_sender_receiver", columnList = "senderId, receiverId"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    /** Username người gửi */
    @Column(nullable = false, length = 100)
    String senderId;

    /** Username người nhận */
    @Column(nullable = false, length = 100)
    String receiverId;

    /** Nội dung tin nhắn */
    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    /** Thời điểm gửi tin nhắn */
    @Column(nullable = false)
    LocalDateTime timestamp;

    /** Trạng thái tin nhắn: SENT, DELIVERED, READ */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MessageStatus status;

}
