package com.example.review.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO tạo đánh giá sau khi booking hoàn thành — PERSON-236.
 *
 * Ràng buộc:
 *  - bookingId  : bắt buộc
 *  - rating     : bắt buộc, 1–5
 *  - comment    : tuỳ chọn, tối đa 1000 ký tự
 *
 * reviewerId KHÔNG nhận từ client — lấy từ JWT để đảm bảo an toàn.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {

    /** ID của booking đã hoàn thành cần đánh giá */
    @NotNull(message = "bookingId là bắt buộc")
    Long bookingId;

    /**
     * Rating từ 1 đến 5.
     * 1 = Rất tệ · 2 = Tệ · 3 = Bình thường · 4 = Tốt · 5 = Xuất sắc
     */
    @NotNull(message = "rating là bắt buộc")
    @Min(value = 1, message = "Rating tối thiểu là 1")
    @Max(value = 5, message = "Rating tối đa là 5")
    Integer rating;

    /** Nội dung đánh giá (tuỳ chọn, tối đa 1000 ký tự) */
    @Size(max = 1000, message = "Nội dung đánh giá không được vượt quá 1000 ký tự")
    String comment;
}
