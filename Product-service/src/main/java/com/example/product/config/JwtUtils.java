package com.example.product.config;

import com.example.product.exception.AppException;
import com.example.product.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility class to extract information from the JWT stored in the SecurityContext.
 * The Identity-service sets the JWT subject ("sub") to the user's username.
 */
@Component
public class JwtUtils {

    /**
     * Returns the authenticated user's identifier (username) from the JWT "sub" claim.
     *
     * @throws AppException with UNAUTHENTICATED if no valid JWT is present
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return subject;
    }
}

