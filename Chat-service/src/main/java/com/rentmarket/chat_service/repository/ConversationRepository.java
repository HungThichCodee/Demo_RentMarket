package com.rentmarket.chat_service.repository;

import com.rentmarket.chat_service.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    Optional<Conversation> findByUserAAndUserB(String userA, String userB);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA = :me OR c.userB = :me
        ORDER BY c.lastTimestamp DESC
        """)
    List<Conversation> findAllByUser(@Param("me") String me);

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
