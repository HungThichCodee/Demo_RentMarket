package com.example.product.exception;

import com.example.product.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Global exception handler for the Product-service.
 * Ensures all errors are returned in a consistent {@link ApiResponse} format
 * and no raw stack traces are ever exposed to the client.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDenied(AccessDeniedException e) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED_ACCESS;
        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AuthenticationException.class)
    ResponseEntity<ApiResponse<?>> handlingAuthentication(AuthenticationException e) {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingRuntimeException(Exception e) {
        log.error("Unhandled exception: ", e);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException e) {
        String enumKey = e.getFieldError() != null ? e.getFieldError().getDefaultMessage() : "";

        ErrorCode errorCode;
        try {
            errorCode = ErrorCode.valueOf(enumKey);
        } catch (IllegalArgumentException ex) {
            errorCode = ErrorCode.INVALID_DATA;
            String validationMessage = (e.getFieldError() != null)
                    ? e.getFieldError().getDefaultMessage()
                    : errorCode.getMessage();

            return ResponseEntity
                    .status(errorCode.getHttpStatusCode())
                    .body(ApiResponse.builder()
                            .code(errorCode.getCode())
                            .message(validationMessage)
                            .build());
        }

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MaxUploadSizeExceededException.class)
    ResponseEntity<ApiResponse<?>> handlingMaxUploadSize(MaxUploadSizeExceededException e) {
        log.warn("Upload size exceeded: {}", e.getMessage());
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.builder()
                        .code(ErrorCode.INVALID_DATA.getCode())
                        .message("Kích thước tệp vượt quá giới hạn cho phép")
                        .build());
    }

    @ExceptionHandler(value = MissingServletRequestParameterException.class)
    ResponseEntity<ApiResponse<?>> handlingMissingParam(MissingServletRequestParameterException e) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.builder()
                        .code(ErrorCode.INVALID_DATA.getCode())
                        .message("Thiếu tham số bắt buộc: " + e.getParameterName())
                        .build());
    }
}
