package com.rentmarket.chat_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PresenceService {

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    public void addUser(String userId) {
        onlineUsers.add(userId);
        log.info("User '{}' ONLINE — Total: {}", userId, onlineUsers.size());
    }

    public void removeUser(String userId) {
        onlineUsers.remove(userId);
        log.info("User '{}' OFFLINE — Total: {}", userId, onlineUsers.size());
    }

    public boolean isOnline(String userId) {
        return onlineUsers.contains(userId);
    }

    public Set<String> getOnlineUsers() {
        return Set.copyOf(onlineUsers);
    }
}
