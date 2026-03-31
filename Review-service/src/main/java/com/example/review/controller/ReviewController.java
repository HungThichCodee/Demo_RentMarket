package com.example.review.controller;

import com.example.review.dto.request.CreateReviewRequest;
import com.example.review.dto.response.ApiResponse;
import com.example.review.dto.response.RatingSummaryResponse;
import com.example.review.dto.response.ReviewResponse;
import com.example.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý tác vụ đánh giá — PERSON-239.
 *
 * Base path: /review/reviews  (context-path /review trong application.yaml)
 *
 * ─── NGƯỜI THUÊ (cần JWT) ────────────────────────────────────────────────
 *  POST /reviews                    Gửi đánh giá sau khi booking hoàn thành
 *  GET  /reviews/my-reviews         Xem đánh giá của tôi
 *
 * ─── PUBLIC (không cần JWT) ──────────────────────────────────────────────
 *  GET  /reviews/product/{id}           Xem đánh giá của sản phẩm
 *  GET  /reviews/product/{id}/rating    Rating trung bình của sản phẩm
 *  GET  /reviews/owner/{ownerId}        Xem đánh giá của chủ đồ
 *  GET  /reviews/owner/{ownerId}/rating Rating trung bình của chủ đồ
 *  GET  /reviews/users/{username}         Xem đánh giá của người dùng (tư cách chủ đồ) — PERSON-252
 *  GET  /reviews/users/{username}/written Xem đánh giá mà người dùng đã viết
 */
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // =========================================================================
    // NGƯỜI THUÊ — cần JWT
    // =========================================================================

    /**
     * Gửi đánh giá sau khi booking hoàn thành — PERSON-239.
     *
     * Ràng buộc (PERSON-241):
     *  - Booking phải ở trạng thái COMPLETED
     *  - Chỉ người thuê của booking mới được gửi
     *  - Mỗi booking chỉ đánh giá một lần
     *
     * POST /review/reviews
     */
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(request))
                .build();
    }

    /**
     * Xem tất cả đánh giá tôi đã gửi (cần JWT).
     *
     * GET /review/reviews/my-reviews?page=0&size=10
     */
    @GetMapping("/my-reviews")
    public ApiResponse<Page<ReviewResponse>> getMyReviews(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getMyReviews(page, size))
                .build();
    }

    // =========================================================================
    // PUBLIC — không cần JWT
    // =========================================================================

    /**
     * Xem danh sách đánh giá của một sản phẩm (public).
     *
     * GET /review/reviews/product/{productId}?page=0&size=10
     */
    @GetMapping("/product/{productId}")
    public ApiResponse<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getProductReviews(productId, page, size))
                .build();
    }

    /**
     * Rating trung bình của sản phẩm (public) — PERSON-240.
     *
     * GET /review/reviews/product/{productId}/rating
     */
    @GetMapping("/product/{productId}/rating")
    public ApiResponse<RatingSummaryResponse> getProductRating(@PathVariable Long productId) {
        return ApiResponse.<RatingSummaryResponse>builder()
                .result(reviewService.getProductRatingSummary(productId))
                .build();
    }

    /**
     * Xem danh sách đánh giá của một chủ đồ (public).
     *
     * GET /review/reviews/owner/{ownerId}?page=0&size=10
     */
    @GetMapping("/owner/{ownerId}")
    public ApiResponse<Page<ReviewResponse>> getOwnerReviews(
            @PathVariable String ownerId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getOwnerReviews(ownerId, page, size))
                .build();
    }

    /**
     * Rating trung bình của chủ đồ (public) — PERSON-240.
     *
     * GET /review/reviews/owner/{ownerId}/rating
     */
    @GetMapping("/owner/{ownerId}/rating")
    public ApiResponse<RatingSummaryResponse> getOwnerRating(@PathVariable String ownerId) {
        return ApiResponse.<RatingSummaryResponse>builder()
                .result(reviewService.getOwnerRatingSummary(ownerId))
                .build();
    }

    /**
     * [PERSON-252] Xem tất cả đánh giá của một người dùng (public, phân trang).
     *
     * Trả về đánh giá mà người dùng nhận được với tư cách CHỦ ĐỒ
     * → giúp đánh giá uy tín khi quyết định có nên thuê sản phẩm của họ.
     *
     * [PERSON-254] Phân trang: page, size (mặc định 0, 10)
     *
     * GET /review/reviews/users/{username}?page=0&size=10
     */
    @GetMapping("/users/{username}")
    public ApiResponse<Page<ReviewResponse>> getUserReviews(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getUserReviews(username, page, size))
                .build();
    }

    /**
     * Xem đánh giá mà người dùng đã viết với tư cách NGƯỜI THUÊ (public, phân trang).
     *
     * Giúp đánh giá mức độ đáng tin cậy của người thuê qua lịch sử đánh giá họ đã gửi.
     *
     * GET /review/reviews/users/{username}/written?page=0&size=10
     */
    @GetMapping("/users/{username}/written")
    public ApiResponse<Page<ReviewResponse>> getReviewsWrittenByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getReviewsWrittenByUser(username, page, size))
                .build();
    }
}
