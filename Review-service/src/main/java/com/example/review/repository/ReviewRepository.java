package com.example.review.repository;

import com.example.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository cho Review entity — PERSON-235.
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Kiểm tra booking đã được người này đánh giá chưa — PERSON-241.
     */
    boolean existsByBookingIdAndReviewerId(Long bookingId, String reviewerId);

    /**
     * Lấy tất cả đánh giá của một sản phẩm, sắp xếp mới nhất trước — phân trang.
     */
    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    /**
     * Lấy tất cả đánh giá của một chủ đồ, sắp xếp mới nhất trước — phân trang.
     */
    Page<Review> findByProductOwnerIdOrderByCreatedAtDesc(String productOwnerId, Pageable pageable);

    /**
     * Lấy tất cả đánh giá của người thuê hiện tại — phân trang.
     */
    Page<Review> findByReviewerIdOrderByCreatedAtDesc(String reviewerId, Pageable pageable);

    /**
     * Tính rating trung bình của sản phẩm — PERSON-240.
     * Trả về null nếu sản phẩm chưa có đánh giá nào.
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId")
    Double calculateAvgRatingByProductId(@Param("productId") Long productId);

    /**
     * Tính rating trung bình của chủ đồ — PERSON-240.
     * Trả về null nếu chủ đồ chưa có đánh giá nào.
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productOwnerId = :ownerId")
    Double calculateAvgRatingByOwnerId(@Param("ownerId") String ownerId);

    /**
     * Đếm số lượng đánh giá của sản phẩm.
     */
    long countByProductId(Long productId);

    /**
     * Đếm số lượng đánh giá của chủ đồ.
     */
    long countByProductOwnerId(String productOwnerId);
}
