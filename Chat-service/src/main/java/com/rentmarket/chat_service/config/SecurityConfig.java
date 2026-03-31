package com.rentmarket.chat_service.config;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

/**
 * Cấu hình Spring Security cho Chat-service.
 *
 * === PHÂN BIỆT 2 TẦNG BẢO MẬT ===
 *
 * 1. REST API (GET /chat/history/**)
 *    → Bảo vệ bởi Spring Security filter chain (file này)
 *    → JWT nằm trong HTTP header "Authorization: Bearer ..."
 *    → Sử dụng JwtDecoder để verify token
 *
 * 2. WebSocket STOMP (/chat/ws)
 *    → Bảo vệ bởi JwtChannelInterceptor (file JwtChannelInterceptor.java)
 *    → JWT nằm trong STOMP CONNECT frame header
 *    → Endpoint /chat/ws phải được permitAll() ở đây để HTTP Upgrade handshake đi qua
 *    → Sau khi upgrade thành WebSocket, JwtChannelInterceptor kiểm tra JWT
 *
 * Tóm lại:
 * - HTTP requests → SecurityFilterChain (file này)
 * - WebSocket frames → JwtChannelInterceptor
 */
@Configuration
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityConfig {

    @NonFinal
    @Value("${jwt.signerKey}")
    String signerKey;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(request -> request
                // Cho phép WebSocket handshake đi qua (HTTP Upgrade request)
                // Sau khi upgrade, JwtChannelInterceptor sẽ verify JWT trong STOMP CONNECT
                .requestMatchers("/chat/ws/**").permitAll()

                // Tất cả REST endpoints khác (GET /chat/history/**) yêu cầu JWT hợp lệ
                .anyRequest().authenticated()
        );

        // Cấu hình OAuth2 Resource Server để verify JWT trong REST API requests
        // Dùng cùng thuật toán HS512 và signerKey với Identity-service
        http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder()))
        );

        // Tắt CSRF — không cần cho REST API + WebSocket
        http.csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    /**
     * JwtDecoder dùng để verify JWT trong HTTP requests (REST API).
     * Cùng cấu hình với Identity-service: HMAC-SHA512 + signerKey chung.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }
}
