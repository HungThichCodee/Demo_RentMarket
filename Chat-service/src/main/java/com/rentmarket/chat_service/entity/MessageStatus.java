package com.rentmarket.chat_service.entity;

/**
 * Enum đại diện cho vòng đời trạng thái của một tin nhắn:
 *
 * SENT      → Tin nhắn đã được gửi lên server và lưu vào DB.
 * DELIVERED → Tin nhắn đã được chuyển tới thiết bị của người nhận.
 * READ      → Người nhận đã đọc tin nhắn.
 */
public enum MessageStatus {
    SENT,
    DELIVERED,
    READ
}
