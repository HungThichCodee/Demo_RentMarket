package com.example.review.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO tổng hợp thống kê đánh giá của một sản phẩm hoặc chủ đồ — PERSON-240.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingSummaryResponse {

    /** ID sản phẩm hoặc username chủ đồ */
    String target;

    /** Rating trung bình (null nếu chưa có đánh giá) */
    Double avgRating;

    /** Tổng số đánh giá */
    long totalReviews;
}
