package com.example.review.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import lombok.Getter;

/**
 * Mã lỗi tập trung cho Review-service.
 */
@Getter
public enum ErrorCode {

    // ===== Hệ thống =====
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_DATA(1008, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    // ===== Xác thực / phân quyền =====
    UNAUTHENTICATED(1010, "Chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED_ACCESS(1009, "Không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),

    // ===== Booking =====
    BOOKING_NOT_FOUND(4001, "Không tìm thấy booking", HttpStatus.NOT_FOUND),
    BOOKING_NOT_COMPLETED(4002, "Chỉ có thể đánh giá sau khi booking hoàn tất (COMPLETED)", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_YOURS(4003, "Bạn không phải người thuê của booking này", HttpStatus.FORBIDDEN),

    // ===== Review =====
    REVIEW_ALREADY_EXISTS(4004, "Booking này đã được đánh giá", HttpStatus.CONFLICT),
    INVALID_RATING(4005, "Rating phải nằm trong khoảng 1–5", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND(4006, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode httpStatusCode;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }
}
