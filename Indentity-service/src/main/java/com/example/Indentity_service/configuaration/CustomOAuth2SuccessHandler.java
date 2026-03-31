package com.example.Indentity_service.configuaration;

import com.example.Indentity_service.entity.User;
import com.example.Indentity_service.enums.Role;
import com.example.Indentity_service.repository.UserRepository;
import com.example.Indentity_service.service.AuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;

    @NonFinal
    @Value("${app.frontend.url:https://codespheree.id.vn}")
    String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String givenName = oAuth2User.getAttribute("given_name");
        String familyName = oAuth2User.getAttribute("family_name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Set<String> roles = new HashSet<>();
            roles.add(Role.USER.name());

            User newUser = User.builder()
                    .email(email)
                    .username(email) // Using email as username for OAuth2
                    .firstName(givenName != null ? givenName : name)
                    .lastName(familyName != null ? familyName : "")
                    .avatarUrl(picture)
                    .roles(roles)
                    .build();
            return userRepository.save(newUser);
        });

        String jwtToken = authenticationService.generateToken(user);
        
        String redirectUrl = frontendBaseUrl + "/oauth2/redirect?token=" + jwtToken;
        log.info("OAuth2 login success for email {}, redirecting to {}", email, redirectUrl);
        
        response.sendRedirect(redirectUrl);
    }
}
