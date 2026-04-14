package com.rentmarket.chat_service.dto;

import com.rentmarket.chat_service.entity.MessageStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationSummaryDto {

    String partnerUsername;
    String lastContent;
    LocalDateTime lastTimestamp;
    MessageStatus lastStatus;
    boolean isLastFromMe;
    int unreadCount;
}
