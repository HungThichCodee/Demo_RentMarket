package com.example.review.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho một đánh giá sau khi booking hoàn thành — PERSON-234.
 *
 * Một booking chỉ được đánh giá MỘT lần bởi người thuê (tenantId).
 * Thông tin productId / productOwnerId được denormalize để tránh gọi inter-service
 * khi truy vấn danh sách đánh giá theo sản phẩm hoặc chủ đồ.
 */
@Entity
@Table(
    name = "reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_booking_reviewer",
        columnNames = {"booking_id", "reviewer_id"}
    )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    /**
     * ID booking đã hoàn thành (khớp với Booking.id bên Rental-service).
     * Unique constraint đảm bảo một booking chỉ có một review.
     */
    @Column(name = "booking_id", nullable = false)
    Long bookingId;

    /**
     * Username người đánh giá (tenantId, lấy từ JWT sub claim).
     * Chỉ người thuê của booking mới được đánh giá.
     */
    @Column(name = "reviewer_id", nullable = false)
    String reviewerId;

    /**
     * ID sản phẩm được đánh giá (denormalized từ Booking.productId).
     */
    @Column(name = "product_id", nullable = false)
    Long productId;

    /**
     * Username chủ đồ (denormalized từ Booking.productOwnerId).
     * Dùng để query đánh giá theo chủ đồ mà không cần gọi lại Rental-service.
     */
    @Column(name = "product_owner_id", nullable = false)
    String productOwnerId;

    /**
     * Rating từ 1 (tệ nhất) đến 5 (tốt nhất).
     */
    @Column(nullable = false)
    Integer rating;

    /**
     * Nội dung đánh giá (tuỳ chọn, tối đa 1000 ký tự).
     */
    @Column(length = 1000)
    String comment;

    /**
     * Thời điểm đánh giá. Được set tự động.
     */
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Review other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
