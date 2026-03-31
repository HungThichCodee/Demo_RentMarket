package com.example.review.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin đánh giá — PERSON-237.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {

    /** ID của đánh giá */
    Long id;

    /** ID booking đã hoàn thành */
    Long bookingId;

    /** Username người đánh giá */
    String reviewerId;

    /** ID sản phẩm được đánh giá */
    Long productId;

    /** Username chủ đồ */
    String productOwnerId;

    /** Rating 1–5 */
    Integer rating;

    /** Nội dung đánh giá */
    String comment;

    /** Thời điểm đánh giá */
    LocalDateTime createdAt;
}
