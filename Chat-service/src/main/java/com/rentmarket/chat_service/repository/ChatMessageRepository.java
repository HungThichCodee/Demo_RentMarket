package com.rentmarket.chat_service.repository;

import com.rentmarket.chat_service.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy vấn tin nhắn chat.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    /**
     * Lấy toàn bộ tin nhắn giữa 2 người dùng, sắp xếp theo thời gian tăng dần.
     *
     * Lấy cả 2 chiều: (A→B) + (B→A) để hiển thị đầy đủ hội thoại.
     */
    @Query("SELECT m FROM ChatMessage m " +
            "WHERE (m.senderId = :user1 AND m.receiverId = :user2) " +
            "   OR (m.senderId = :user2 AND m.receiverId = :user1) " +
            "ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(
            @Param("user1") String user1,
            @Param("user2") String user2
    );
}
