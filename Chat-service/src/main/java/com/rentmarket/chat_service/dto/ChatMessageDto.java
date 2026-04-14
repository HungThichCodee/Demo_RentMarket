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
public class ChatMessageDto {

    String id;
    String senderId;
    String receiverId;
    String content;
    LocalDateTime timestamp;
    MessageStatus status;
}
