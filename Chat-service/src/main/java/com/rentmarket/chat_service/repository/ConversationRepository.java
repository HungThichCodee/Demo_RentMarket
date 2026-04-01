package com.rentmarket.chat_service.repository;

import com.rentmarket.chat_service.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho bảng `conversations`.
 *
 * === THIẾT KẾ ===
 * Mọi truy vấn đều dựa trên index (user_a, last_timestamp) hoặc
 * (user_b, last_timestamp) → O(log N), không scan toàn bảng.
 *
 * Không dùng nativeQuery vì JPQL đủ mạnh cho các truy vấn này.
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    /**
     * Tìm conversation của 1 cặp user cụ thể.
     *
     * Luôn truyền (smaller, larger) — gọi bên service, không phải ở đây.
     * Dùng cho UPSERT: kiểm tra row đã tồn tại chưa trước khi tạo mới.
     */
    Optional<Conversation> findByUserAAndUserB(String userA, String userB);

    /**
     * Lấy toàn bộ hội thoại của một user, sắp xếp theo tin nhắn mới nhất.
     *
     * Dùng 2 index riêng biệt (idx_conv_user_a_ts và idx_conv_user_b_ts)
     * thay vì 1 OR query để tối ưu execution plan của MySQL.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA = :me OR c.userB = :me
        ORDER BY c.lastTimestamp DESC
        """)
    List<Conversation> findAllByUser(@Param("me") String me);

    /**
     * Reset unread count về 0 khi user mở cuộc trò chuyện với partner.
     *
     * Được gọi từ endpoint PATCH /chat/conversations/{partnerUsername}/read.
     * @Modifying + @Query để tránh load entity rồi save lại (không cần thiết).
     */
    @Modifying
    @Query("""
        UPDATE Conversation c SET
            c.unreadCountA = CASE WHEN c.userA = :me THEN 0 ELSE c.unreadCountA END,
            c.unreadCountB = CASE WHEN c.userB = :me THEN 0 ELSE c.unreadCountB END
        WHERE (c.userA = :me AND c.userB = :partner)
           OR (c.userA = :partner AND c.userB = :me)
        """)
    void markAsRead(@Param("me") String me, @Param("partner") String partner);
}
