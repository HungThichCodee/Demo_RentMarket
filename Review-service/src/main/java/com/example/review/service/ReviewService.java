package com.example.review.service;

import com.example.review.config.JwtUtils;
import com.example.review.dto.request.CreateReviewRequest;
import com.example.review.dto.response.ApiResponse;
import com.example.review.dto.response.RatingSummaryResponse;
import com.example.review.dto.response.ReviewResponse;
import com.example.review.entity.Review;
import com.example.review.exception.AppException;
import com.example.review.exception.ErrorCode;
import com.example.review.mapper.ReviewMapper;
import com.example.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;

/**
 * Service xử lý nghiệp vụ đánh giá sản phẩm và chủ đồ — PERSON-238, 240, 241.
 *
 * Nguyên tắc bảo mật:
 *  - reviewerId luôn lấy từ JWT, không nhận từ client.
 *  - Chỉ người thuê (tenantId) của booking mới được đánh giá.
 *
 * Ràng buộc nghiệp vụ (PERSON-241):
 *  - Booking phải ở trạng thái COMPLETED.
 *  - Một booking chỉ được đánh giá một lần (unique constraint trên DB + check ở service).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    /** Số phần tử tối đa mỗi trang để tránh query quá lớn */
    private static final int MAX_PAGE_SIZE = 50;

    private final ReviewRepository reviewRepository;
    private final ReviewMapper     reviewMapper;
    private final RestTemplate     restTemplate;
    private final JwtUtils         jwtUtils;

    @Value("${app.rental-service.url}")
    private String rentalServiceUrl;

    // =========================================================================
    // TẠO ĐÁNH GIÁ — PERSON-238, 241
    // =========================================================================

    /**
     * Người thuê gửi đánh giá sau khi booking hoàn thành.
     *
     * Luồng:
     *  1. Lấy reviewerId từ JWT
     *  2. Gọi Rental-service xác nhận booking (forward JWT để tránh 401)
     *  3. [PERSON-241] Validate: booking.status == COMPLETED
     *  4. [PERSON-241] Validate: booking.tenantId == reviewerId
     *  5. [PERSON-241] Validate: booking chưa được đánh giá
     *  6. Lưu Review entity
     */
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        String reviewerId = jwtUtils.getCurrentUsername();

        // Bước 2-4: Lấy và validate booking từ Rental-service (forwarding JWT)
        BookingData booking = fetchAndValidateBooking(request.getBookingId(), reviewerId);

        // Bước 5 [PERSON-241]: Kiểm tra chưa có review cho booking này
        if (reviewRepository.existsByBookingIdAndReviewerId(request.getBookingId(), reviewerId)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // Bước 6: Lưu đánh giá
        Review review = Review.builder()
                .bookingId(request.getBookingId())
                .reviewerId(reviewerId)
                .productId(booking.productId())
                .productOwnerId(booking.productOwnerId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return reviewMapper.toReviewResponse(reviewRepository.save(review));
    }

    // =========================================================================
    // TRUY VẤN
    // =========================================================================

    /**
     * Xem danh sách đánh giá của một sản phẩm, phân trang (public).
     * Page size tối đa là MAX_PAGE_SIZE để tránh query nặng.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, clampSize(size));
        return reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    /**
     * Xem danh sách đánh giá của một chủ đồ, phân trang (public).
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getOwnerReviews(String ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, clampSize(size));
        return reviewRepository
                .findByProductOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    /**
     * [PERSON-253] Xem đánh giá về một người dùng với tư cách CHỦ ĐỒ (public, phân trang).
     *
     * Khác với getOwnerReviews() ở chỗ đây là entry point từ ngữ cảnh "người dùng",
     * không phải "chủ đồ" — cho phép mở rộng sau này (VD: thêm cả đánh giá tenant).
     *
     * [PERSON-254] Kết quả phân trang — sắp xếp mới nhất trước.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getUserReviews(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, clampSize(size));
        return reviewRepository
                .findByProductOwnerIdOrderByCreatedAtDesc(username, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    /**
     * Xem đánh giá mà người dùng đã viết (với tư cách NGƯỜI THUÊ), phân trang.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsWrittenByUser(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, clampSize(size));
        return reviewRepository
                .findByReviewerIdOrderByCreatedAtDesc(username, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    /**
     * Xem danh sách đánh giá của tôi (người đang đăng nhập), phân trang.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(int page, int size) {
        String reviewerId = jwtUtils.getCurrentUsername();
        Pageable pageable = PageRequest.of(page, clampSize(size));
        return reviewRepository
                .findByReviewerIdOrderByCreatedAtDesc(reviewerId, pageable)
                .map(reviewMapper::toReviewResponse);
    }

    /**
     * Rating trung bình của sản phẩm — PERSON-240.
     * avgRating được làm tròn 1 chữ số thập phân (VD: 4.3).
     */
    @Transactional(readOnly = true)
    public RatingSummaryResponse getProductRatingSummary(Long productId) {
        Double avg   = reviewRepository.calculateAvgRatingByProductId(productId);
        long   total = reviewRepository.countByProductId(productId);
        return RatingSummaryResponse.builder()
                .target(String.valueOf(productId))
                .avgRating(roundAvg(avg))
                .totalReviews(total)
                .build();
    }

    /**
     * Rating trung bình của chủ đồ — PERSON-240.
     */
    @Transactional(readOnly = true)
    public RatingSummaryResponse getOwnerRatingSummary(String ownerId) {
        Double avg   = reviewRepository.calculateAvgRatingByOwnerId(ownerId);
        long   total = reviewRepository.countByProductOwnerId(ownerId);
        return RatingSummaryResponse.builder()
                .target(ownerId)
                .avgRating(roundAvg(avg))
                .totalReviews(total)
                .build();
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Gọi Rental-service để lấy và validate booking — PERSON-241.
     *
     * FIX: Forward JWT Bearer token trong header để tránh 401 từ Rental-service
     * (GET /rental/bookings/{id} yêu cầu xác thực).
     *
     * @param bookingId  ID booking cần kiểm tra
     * @param reviewerId username người đánh giá (từ JWT)
     * @return BookingData chứa productId và productOwnerId
     * @throws AppException BOOKING_NOT_FOUND      nếu booking không tồn tại hoặc lỗi mạng
     * @throws AppException BOOKING_NOT_COMPLETED  nếu booking chưa COMPLETED
     * @throws AppException BOOKING_NOT_YOURS      nếu không phải người thuê của booking
     */
    private BookingData fetchAndValidateBooking(Long bookingId, String reviewerId) {
        try {
            String url = rentalServiceUrl + "/" + bookingId;

            // Forward JWT token sang Rental-service để tránh 401
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(extractRawJwt());
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<ApiResponse> responseEntity =
                    restTemplate.exchange(url, HttpMethod.GET, entity, ApiResponse.class);

            ApiResponse<?> response = responseEntity.getBody();
            if (response == null || response.getResult() == null) {
                throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
            }

            LinkedHashMap<?, ?> data = (LinkedHashMap<?, ?>) response.getResult();
            String status    = (String) data.get("status");
            String tenantId  = (String) data.get("tenantId");
            Long   productId = ((Number) data.get("productId")).longValue();
            String ownerId   = (String) data.get("productOwnerId");

            // [PERSON-241] Booking phải COMPLETED
            if (!"COMPLETED".equals(status)) {
                throw new AppException(ErrorCode.BOOKING_NOT_COMPLETED);
            }

            // [PERSON-241] Chỉ người thuê mới được đánh giá
            if (!reviewerId.equals(tenantId)) {
                throw new AppException(ErrorCode.BOOKING_NOT_YOURS);
            }

            return new BookingData(productId, ownerId);

        } catch (AppException e) {
            throw e;
        } catch (HttpClientErrorException.NotFound e) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        } catch (Exception e) {
            log.warn("Không thể xác thực booking bookingId={}: {}", bookingId, e.getMessage());
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    /**
     * Lấy raw JWT token string từ Security context để forward sang Rental-service.
     */
    private String extractRawJwt() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return jwt.getTokenValue();
    }

    /**
     * Làm tròn rating trung bình đến 1 chữ số thập phân.
     * Trả về null nếu chưa có đánh giá nào.
     */
    private Double roundAvg(Double avg) {
        if (avg == null) return null;
        return Math.round(avg * 10.0) / 10.0;
    }

    /**
     * Giới hạn page size trong khoảng [1, MAX_PAGE_SIZE].
     * Tránh client gửi size=999999 gây query nặng.
     */
    private int clampSize(int size) {
        return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
    }

    /** Record nội bộ chứa thông tin booking cần thiết để tạo review. */
    private record BookingData(Long productId, String productOwnerId) {}
}
