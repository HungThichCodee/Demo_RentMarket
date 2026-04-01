package com.example.Indentity_service.controller;

import com.example.Indentity_service.dto.request.AuthenticationRequest;
import com.example.Indentity_service.dto.request.ForgotPasswordRequest;
import com.example.Indentity_service.dto.request.IntrospectRequest;
import com.example.Indentity_service.dto.request.ResetPasswordRequest;
import com.example.Indentity_service.dto.response.ApiResponse;
import com.example.Indentity_service.dto.response.AuthenticaitionResponse;
import com.example.Indentity_service.dto.response.IntrospectResponse;
import com.example.Indentity_service.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<AuthenticaitionResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticated(request);
        return ApiResponse.<AuthenticaitionResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/forgot-password")
    ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request.getEmail());
        return ApiResponse.<String>builder()
                .result("Mã xác minh đã được gửi đến email của bạn.")
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ApiResponse.<String>builder()
                .result("Mật khẩu đã được cập nhật thành công.")
                .build();
    }

}
