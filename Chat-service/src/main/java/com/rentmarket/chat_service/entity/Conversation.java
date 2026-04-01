package com.rentmarket.chat_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho một cuộc hội thoại giữa 2 người dùng.
 *
 * === MỤC ĐÍCH ===
 * Thay vì phải query toàn bộ `chat_messages` để tìm tin mới nhất
 * mỗi khi load inbox (O(N) → chậm), bảng này hoạt động như một
 * "materialized index" — được cập nhật mỗi khi có tin mới gửi đi.
 *
 * Load inbox = SELECT * FROM conversations WHERE user_a = :me ... → O(1)
 *
 * === BẤT BIẾN QUAN TRỌNG ===
 * userA LUÔN là username nhỏ hơn theo thứ tự từ điển (lexicographic).
 * userB LUÔN là username lớn hơn.
 *
 * Quy tắc này đảm bảo mỗi cặp (alice, bob) chỉ tạo ĐÚNG MỘT row,
 * bất kể ai là người gửi tin đầu tiên.
 *
 * Ví dụ: alice nhắn bob → userA="alice", userB="bob"
 *         bob nhắn alice → cũng tìm row (userA="alice", userB="bob") để update
 *
 * === UNREAD COUNT ===
 * unreadCountA = số tin chưa đọc dành cho userA (do userB gửi)
 * unreadCountB = số tin chưa đọc dành cho userB (do userA gửi)
 * Reset về 0 khi người dùng mở cuộc trò chuyện (đánh dấu READ).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(
    name = "conversations",
    uniqueConstraints = {
        // Đảm bảo mỗi cặp user chỉ có 1 row duy nhất
        @UniqueConstraint(name = "uq_conversation_pair", columnNames = {"user_a", "user_b"})
    },
    indexes = {
        // Index cho user_a: load inbox của userA theo thứ tự mới nhất
        @Index(name = "idx_conv_user_a_ts", columnList = "user_a, last_timestamp DESC"),
        // Index cho user_b: load inbox của userB theo thứ tự mới nhất
        @Index(name = "idx_conv_user_b_ts", columnList = "user_b, last_timestamp DESC")
    }
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    /**
     * Username nhỏ hơn theo thứ tự từ điển.
     * Không bao giờ thay đổi sau khi tạo.
     */
    @Column(name = "user_a", nullable = false, length = 100, updatable = false)
    String userA;

    /**
     * Username lớn hơn theo thứ tự từ điển.
     * Không bao giờ thay đổi sau khi tạo.
     */
    @Column(name = "user_b", nullable = false, length = 100, updatable = false)
    String userB;

    /** ID của tin nhắn mới nhất (FK mềm — không dùng @ManyToOne để tránh N+1) */
    @Column(name = "last_message_id", length = 36)
    String lastMessageId;

    /** Nội dung tin nhắn cuối (snippet, tối đa 255 ký tự) */
    @Column(name = "last_content", columnDefinition = "TEXT")
    String lastContent;

    /** Username của người gửi tin nhắn cuối */
    @Column(name = "last_sender", length = 100)
    String lastSender;

    /** Thời điểm của tin nhắn cuối — dùng để sort inbox */
    @Column(name = "last_timestamp", nullable = false)
    LocalDateTime lastTimestamp;

    /** Số tin chưa đọc dành cho userA (do userB gửi) */
    @Column(name = "unread_count_a", nullable = false)
    @Builder.Default
    int unreadCountA = 0;

    /** Số tin chưa đọc dành cho userB (do userA gửi) */
    @Column(name = "unread_count_b", nullable = false)
    @Builder.Default
    int unreadCountB = 0;

    /** Trạng thái của tin nhắn cuối — dùng để hiện icon tick trong sidebar */
    @Enumerated(EnumType.STRING)
    @Column(name = "last_status", length = 20)
    MessageStatus lastStatus;
}
