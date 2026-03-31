package com.rentmarket.chat_service.service;

import com.rentmarket.chat_service.dto.ChatMessageDto;
import com.rentmarket.chat_service.entity.ChatMessage;
import com.rentmarket.chat_service.entity.MessageStatus;
import com.rentmarket.chat_service.repository.ChatMessageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho tin nhắn chat.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatService {

    ChatMessageRepository chatMessageRepository;

    /**
     * Lưu tin nhắn mới vào database.
     * Server gán timestamp + status để đảm bảo tính nhất quán, không tin client.
     */
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        ChatMessage message = ChatMessage.builder()
                .senderId(dto.getSenderId())
                .receiverId(dto.getReceiverId())
                .content(dto.getContent())
                .timestamp(LocalDateTime.now())
                .status(MessageStatus.SENT)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        log.info("Đã lưu tin nhắn: {} → {} (id: {})",
                saved.getSenderId(), saved.getReceiverId(), saved.getId());

        return toDto(saved);
    }

    /**
     * Lấy lịch sử chat giữa 2 người dùng, sắp xếp theo thời gian tăng dần.
     * Truy vấn cả 2 chiều: (A→B) + (B→A).
     */
    public List<ChatMessageDto> getChatHistory(String user1, String user2) {
        List<ChatMessage> messages = chatMessageRepository.findChatHistory(user1, user2);
        log.debug("Lịch sử chat {} ↔ {}: {} tin nhắn", user1, user2, messages.size());

        return messages.stream()
                .map(this::toDto)
                .toList();
    }

    private ChatMessageDto toDto(ChatMessage entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .senderId(entity.getSenderId())
                .receiverId(entity.getReceiverId())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .status(entity.getStatus())
                .build();
    }
}
