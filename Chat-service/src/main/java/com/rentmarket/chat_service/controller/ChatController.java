package com.rentmarket.chat_service.controller;

import com.rentmarket.chat_service.dto.ChatMessageDto;
import com.rentmarket.chat_service.dto.ConversationSummaryDto;
import com.rentmarket.chat_service.service.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {

    SimpMessagingTemplate messagingTemplate;
    ChatService           chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto, Principal principal) {
        chatMessageDto.setSenderId(principal.getName());
        ChatMessageDto saved = chatService.saveMessage(chatMessageDto);

        messagingTemplate.convertAndSendToUser(saved.getReceiverId(), "/queue/messages", saved);
        messagingTemplate.convertAndSendToUser(saved.getSenderId(),   "/queue/messages", saved);
    }

    @GetMapping("/chat/history/{user1}/{user2}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(
            @PathVariable String user1,
            @PathVariable String user2) {
        return ResponseEntity.ok(chatService.getChatHistory(user1, user2));
    }

    @GetMapping("/chat/conversations/me")
    public ResponseEntity<List<ConversationSummaryDto>> getMyConversations(Principal principal) {
        return ResponseEntity.ok(chatService.getConversations(principal.getName()));
    }

    @PatchMapping("/chat/conversations/{partnerUsername}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String partnerUsername,
            Principal principal) {
        chatService.markConversationAsRead(principal.getName(), partnerUsername);
        return ResponseEntity.noContent().build();
    }
}
