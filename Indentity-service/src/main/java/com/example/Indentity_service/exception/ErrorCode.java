package com.example.Indentity_service.exception;

public enum ErrorCode {
    INVALID_KEY(1001, "Sai key Enum"),
    USER_EXISTED(1002, "User Existed"),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized Exception"),
    USERNAME_INVALID(1003, "Tài khoản phải lớn hớn < 2 và > 20"),
    PASSWORD_INVALD(1004, "Password phải lớn hơn 8 ký tự"),
    EMAIL_INVALID(1005, "Email phải đúng dinh dạng"),
    USER_NOT_EXISTED(1006, "User Not Existed"),
    UNAUTHENTICATED(1007,"Unauthenticated")
    ;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
    private int code;
    private String message;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
