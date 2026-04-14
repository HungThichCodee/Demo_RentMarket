package com.rentmarket.chat_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_sender_receiver", columnList = "senderId, receiverId"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false, length = 100)
    String senderId;

    @Column(nullable = false, length = 100)
    String receiverId;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(nullable = false)
    LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MessageStatus status;

}
