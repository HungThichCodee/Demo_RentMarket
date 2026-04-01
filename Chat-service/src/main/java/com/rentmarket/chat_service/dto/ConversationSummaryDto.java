package com.rentmarket.chat_service.dto;

import com.rentmarket.chat_service.entity.MessageStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * DTO trả về cho endpoint GET /chat/conversations/me
 *
 * Tách biệt hoàn toàn khỏi ChatMessageDto để:
 * 1. Client inbox chỉ nhận dữ liệu cần thiết (không thừa).
 * 2. Dễ mở rộng sau này (thêm avatarUrl, typing indicator...) mà không
 *    ảnh hưởng đến contract của ChatMessageDto.
 * 3. Rõ ràng về mục đích: đây là "tóm tắt hội thoại", không phải "tin nhắn".
 *
 * === Fields ===
 * partnerUsername  → username của đối tác hội thoại
 * lastContent      → nội dung tin nhắn cuối (snippet hiển thị trong sidebar)
 * lastTimestamp    → thời gian tin nhắn cuối (dùng để format "vừa xong", "2 giờ trước"...)
 * lastStatus       → trạng thái: SENT / DELIVERED / READ
 * isLastFromMe     → true nếu tin cuối do mình gửi (hiển thị "Bạn: ..." trong sidebar)
 * unreadCount      → số tin chưa đọc của user hiện tại trong hội thoại này
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationSummaryDto {

    /** Username của người dùng kia trong hội thoại */
    String partnerUsername;

    /** Nội dung tin nhắn mới nhất (hiển thị dưới tên trong sidebar) */
    String lastContent;

    /** Thời điểm tin nhắn mới nhất */
    LocalDateTime lastTimestamp;

    /**
     * Trạng thái tin nhắn cuối.
     * Thường dùng để hiện icon "đã xem" (READ), "đã gửi" (SENT)...
     */
    MessageStatus lastStatus;

    /**
     * true  → tin cuối do chính user đang đăng nhập gửi  → hiện "Bạn: ..."
     * false → tin cuối do partner gửi                   → hiện nội dung gốc
     */
    boolean isLastFromMe;

    /**
     * Số tin chưa đọc của user hiện tại trong hội thoại này.
     * = 0 nếu user đã đọc hết, > 0 nếu có tin mới từ partner.
     */
    int unreadCount;
}
