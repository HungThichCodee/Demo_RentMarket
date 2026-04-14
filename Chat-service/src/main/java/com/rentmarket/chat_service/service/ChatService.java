package com.rentmarket.chat_service.service;

import com.rentmarket.chat_service.dto.ChatMessageDto;
import com.rentmarket.chat_service.dto.ConversationSummaryDto;
import com.rentmarket.chat_service.entity.ChatMessage;
import com.rentmarket.chat_service.entity.Conversation;
import com.rentmarket.chat_service.entity.MessageStatus;
import com.rentmarket.chat_service.repository.ChatMessageRepository;
import com.rentmarket.chat_service.repository.ConversationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {

    ChatMessageRepository  chatMessageRepository;
    ConversationRepository conversationRepository;

    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        ChatMessage message = ChatMessage.builder()
                .senderId(dto.getSenderId())
                .receiverId(dto.getReceiverId())
                .content(dto.getContent())
                .timestamp(LocalDateTime.now())
                .status(MessageStatus.SENT)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        upsertConversation(saved);
        return toMessageDto(saved);
    }

    @Transactional
    public void markConversationAsRead(String me, String partner) {
        conversationRepository.markAsRead(me, partner);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(String user1, String user2) {
        return chatMessageRepository.findChatHistory(user1, user2)
                .stream()
                .map(this::toMessageDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> getConversations(String me) {
        return conversationRepository.findAllByUser(me)
                .stream()
                .map(conv -> toSummaryDto(conv, me))
                .toList();
    }

    private void upsertConversation(ChatMessage msg) {
        String sender   = msg.getSenderId();
        String receiver = msg.getReceiverId();

        boolean senderIsSmaller = sender.compareTo(receiver) < 0;
        String userA = senderIsSmaller ? sender : receiver;
        String userB = senderIsSmaller ? receiver : sender;

        Conversation conv = conversationRepository
                .findByUserAAndUserB(userA, userB)
                .orElseGet(() -> Conversation.builder()
                        .userA(userA)
                        .userB(userB)
                        .unreadCountA(0)
                        .unreadCountB(0)
                        .build());

        conv.setLastMessageId(msg.getId());
        conv.setLastContent(msg.getContent());
        conv.setLastSender(sender);
        conv.setLastTimestamp(msg.getTimestamp());
        conv.setLastStatus(msg.getStatus());

        if (sender.equalsIgnoreCase(userA)) {
            conv.setUnreadCountB(conv.getUnreadCountB() + 1);
        } else {
            conv.setUnreadCountA(conv.getUnreadCountA() + 1);
        }

        try {
            conversationRepository.save(conv);
        } catch (DataIntegrityViolationException e) {
            conversationRepository.findByUserAAndUserB(userA, userB).ifPresent(existing -> {
                existing.setLastMessageId(msg.getId());
                existing.setLastContent(msg.getContent());
                existing.setLastSender(sender);
                existing.setLastTimestamp(msg.getTimestamp());
                existing.setLastStatus(msg.getStatus());
                if (sender.equalsIgnoreCase(userA)) {
                    existing.setUnreadCountB(existing.getUnreadCountB() + 1);
                } else {
                    existing.setUnreadCountA(existing.getUnreadCountA() + 1);
                }
                conversationRepository.save(existing);
            });
        }
    }

    private ChatMessageDto toMessageDto(ChatMessage entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .senderId(entity.getSenderId())
                .receiverId(entity.getReceiverId())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .status(entity.getStatus())
                .build();
    }

    private ConversationSummaryDto toSummaryDto(Conversation conv, String me) {
        boolean iAmUserA = conv.getUserA().equalsIgnoreCase(me);

        return ConversationSummaryDto.builder()
                .partnerUsername(iAmUserA ? conv.getUserB() : conv.getUserA())
                .lastContent(conv.getLastContent())
                .lastTimestamp(conv.getLastTimestamp())
                .lastStatus(conv.getLastStatus())
                .isLastFromMe(me.equalsIgnoreCase(conv.getLastSender()))
                .unreadCount(iAmUserA ? conv.getUnreadCountA() : conv.getUnreadCountB())
                .build();
    }
}
