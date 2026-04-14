package com.rentmarket.chat_service.config;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    @Value("${jwt.signerKey}")
    private String signerKey;

    private JWSVerifier verifier;

    @PostConstruct
    void init() {
        try {
            this.verifier = new MACVerifier(signerKey.getBytes());
        } catch (Exception e) {
            throw new IllegalStateException("Không thể khởi tạo JWT verifier: " + e.getMessage(), e);
        }
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        log.debug("Nhận STOMP CONNECT frame — bắt đầu xác thực JWT");

        String token = extractToken(accessor);
        JWTClaimsSet claims = validateToken(token);
        UsernamePasswordAuthenticationToken authentication = buildAuthentication(claims);

        accessor.setUser(authentication);
        log.info("Xác thực thành công — User '{}' đã kết nối WebSocket", claims.getSubject());

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.error("CONNECT bị từ chối: thiếu hoặc sai định dạng Authorization header");
            throw new IllegalArgumentException("Thiếu hoặc sai định dạng Authorization header");
        }

        return authHeader.substring(BEARER_PREFIX.length());
    }

    private JWTClaimsSet validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            if (!signedJWT.verify(verifier)) {
                throw new IllegalArgumentException("Chữ ký JWT không hợp lệ");
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            Date expirationTime = claims.getExpirationTime();
            if (expirationTime != null && expirationTime.before(new Date())) {
                throw new IllegalArgumentException("JWT token đã hết hạn");
            }

            return claims;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi xác thực JWT: {}", e.getMessage());
            throw new IllegalArgumentException("Không thể xác thực JWT token: " + e.getMessage());
        }
    }

    private UsernamePasswordAuthenticationToken buildAuthentication(JWTClaimsSet claims) {
        String username = claims.getSubject();
        String scope = (String) claims.getClaim("scope");

        List<SimpleGrantedAuthority> authorities = (scope != null && !scope.isBlank())
                ? Arrays.stream(scope.split(" "))
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .toList()
                : List.of();

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }
}
