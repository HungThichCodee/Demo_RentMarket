package com.rentmarket.chat_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý trạng thái Online/Offline của người dùng.
 *
 * Dùng ConcurrentHashMap.newKeySet() để thread-safe khi nhiều WebSocket events
 * xảy ra song song. Dữ liệu nằm trong RAM — mất khi restart server.
 * Điều này đúng đắn vì server restart = tất cả WebSocket connection đều đứt.
 */
@Service
@Slf4j
public class PresenceService {

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    public void addUser(String userId) {
        onlineUsers.add(userId);
        log.info("User '{}' ONLINE — Tổng: {}", userId, onlineUsers.size());
    }

    /**
     * Xóa user khỏi danh sách online.
     * Được gọi trong CẢ HAI trường hợp: user chủ động đóng kết nối
     * VÀ server phát hiện mất kết nối qua heartbeat timeout → không có ghost status.
     */
    public void removeUser(String userId) {
        onlineUsers.remove(userId);
        log.info("User '{}' OFFLINE — Tổng: {}", userId, onlineUsers.size());
    }

    public boolean isOnline(String userId) {
        return onlineUsers.contains(userId);
    }

    /**
     * Trả về snapshot bất biến (immutable copy) của danh sách online.
     * Set.copyOf() tạo bản sao → caller không thể modify set gốc.
     */
    public Set<String> getOnlineUsers() {
        return Set.copyOf(onlineUsers);
    }
}
