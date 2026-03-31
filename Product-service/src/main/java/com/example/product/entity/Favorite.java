package com.example.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Entity lưu danh sách yêu thích của người dùng đối với một sản phẩm.
 * PERSON-258
 */
@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "item_id"}) // Mỗi user chỉ có thể like 1 item 1 lần
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    /**
     * ID của người dùng (từ Identity-service) đã thích sản phẩm này.
     */
    @Column(name = "user_id", nullable = false)
    String userId;

    /**
     * Sản phẩm được yêu thích.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    Item item;

    /**
     * Ngày giờ thêm vào yêu thích.
     */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
