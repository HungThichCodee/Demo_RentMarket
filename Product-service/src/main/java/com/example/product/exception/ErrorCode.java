package com.example.product.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

/**
 * Centralized error codes for the Product-service.
 * Each code carries a unique numeric identifier, a user-facing message,
 * and the appropriate HTTP status to return.
 */
@Getter
public enum ErrorCode {
    INVALID_KEY(1001, "Sai key Enum", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized Exception", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_DATA(1008, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED_ACCESS(1009, "Không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    ITEM_NOT_FOUND(2001, "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    ITEM_ALREADY_RENTED(2002, "Sản phẩm đã được thuê", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(2003, "Danh mục không tồn tại", HttpStatus.NOT_FOUND),
    ITEM_CURRENTLY_RENTED(2004, "Sản phẩm đang được thuê, không thể xóa", HttpStatus.CONFLICT),
    MAX_IMAGES_REACHED(2005, "Đã đạt tối đa 5 ảnh cho sản phẩm", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_ERROR(2006, "Lỗi khi tải lên tệp", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_DELETE_ERROR(2007, "Lỗi khi xóa tệp", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE(2008, "Tên tệp không hợp lệ", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_EXISTS(2009, "Tên danh mục đã tồn tại", HttpStatus.BAD_REQUEST),
    CATEGORY_IN_USE(2010, "Danh mục đang được sử dụng, không thể xóa", HttpStatus.CONFLICT),
    UNAUTHENTICATED(1010, "Chưa đăng nhập hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
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
