package com.example.review.config;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility lấy thông tin người dùng hiện tại từ JWT.
 * JWT sub claim chứa username của người dùng.
 */
@Component
public class JwtUtils {

    /**
     * Lấy username (sub claim) của người dùng đang đăng nhập từ Security context.
     *
     * @return username của người dùng hiện tại
     */
    public String getCurrentUsername() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getSubject();
    }
}
