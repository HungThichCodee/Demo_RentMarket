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
@Table(
    name = "conversations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_conversation_pair", columnNames = {"user_a", "user_b"})
    },
    indexes = {
        @Index(name = "idx_conv_user_a_ts", columnList = "user_a, last_timestamp DESC"),
        @Index(name = "idx_conv_user_b_ts", columnList = "user_b, last_timestamp DESC")
    }
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_a", nullable = false, length = 100, updatable = false)
    String userA;

    @Column(name = "user_b", nullable = false, length = 100, updatable = false)
    String userB;

    @Column(name = "last_message_id", length = 36)
    String lastMessageId;

    @Column(name = "last_content", columnDefinition = "TEXT")
    String lastContent;

    @Column(name = "last_sender", length = 100)
    String lastSender;

    @Column(name = "last_timestamp", nullable = false)
    LocalDateTime lastTimestamp;

    @Column(name = "unread_count_a", nullable = false)
    @Builder.Default
    int unreadCountA = 0;

    @Column(name = "unread_count_b", nullable = false)
    @Builder.Default
    int unreadCountB = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_status", length = 20)
    MessageStatus lastStatus;
}
