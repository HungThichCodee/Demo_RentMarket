package com.example.product.repository;

import com.example.product.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho bảng Favorite (PERSON-259)
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    /**
     * Tìm xem ngừoi dùng đã like sản phẩm này chưa.
     */
    Optional<Favorite> findByUserIdAndItemId(String userId, Long itemId);

    /**
     * Trả về danh sách yêu thích của người dùng.
     */
    Page<Favorite> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Kiểm tra nhanh trạng thái tồn tại.
     */
    boolean existsByUserIdAndItemId(String userId, Long itemId);

    /**
     * Đếm tổng số tim của 1 món đồ.
     */
    long countByItemId(Long itemId);
}
