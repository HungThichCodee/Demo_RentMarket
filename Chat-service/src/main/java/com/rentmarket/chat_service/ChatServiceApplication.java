package com.rentmarket.chat_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point cho Chat-service.
 *
 * === KIẾN TRÚC ROUTING (KHÔNG DÙNG EUREKA) ===
 *
 * Dự án RentMarket sử dụng Spring Cloud Gateway với routing TĨNH (static routes),
 * KHÔNG sử dụng Eureka Service Discovery.
 *
 * Luồng request:
 *
 *   Client (React Frontend, port 5173)
 *       │
 *       ▼
 *   API Gateway (port 8888) ─── application.yaml routes:
 *       │
 *       ├── /identity/** → http://localhost:8080  (Identity-service)
 *       ├── /product/**  → http://localhost:8081  (Product-service)
 *       ├── /rental/**   → http://localhost:8082  (Rental-service)
 *       ├── /review/**   → http://localhost:8083  (Review-service)
 *       └── /chat/**     → ws://localhost:8084    (Chat-service) ← CHÚNG TA
 *
 * Route cho Chat-service đã được cấu hình sẵn trong API Gateway:
 *   - id: chat-service
 *     uri: ${CHAT_SERVICE_URL:ws://localhost:8084}
 *     predicates:
 *       - Path=/chat/**
 *
 * Lưu ý quan trọng:
 * - Gateway dùng ws:// (WebSocket protocol) cho chat-service, KHÔNG phải http://
 * - Điều này cho phép STOMP WebSocket frames đi qua Gateway tới /chat/ws
 * - REST API (GET /chat/history/**) cũng đi qua route này
 *
 * === TẠI SAO KHÔNG DÙNG EUREKA? ===
 * Dự án hiện tại có quy mô nhỏ-vừa, mỗi service chỉ chạy 1 instance.
 * Static routing đơn giản hơn, không cần thêm Eureka Server.
 * Khi cần scale (nhiều instance), có thể migrate sang Eureka + load balancing sau.
 */
@SpringBootApplication
public class ChatServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatServiceApplication.class, args);
    }
}
