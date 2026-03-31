package com.example.product.service;

import com.example.product.dto.response.ItemResponse;
import org.springframework.data.domain.Page;

/**
 * Service xử lý tính năng Danh sách yêu thích (PERSON-263)
 */
public interface FavoriteService {

    /**
     * Thêm sản phẩm vào danh sách yêu thích của người dùng hiện tại (lấy từ JWT).
     */
    void addFavorite(Long itemId);

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích của người dùng hiện tại.
     */
    void removeFavorite(Long itemId);

    /**
     * Lấy danh sách sản phẩm yêu thích của người dùng (có phân trang).
     * Trả về ItemResponse để tận dụng giao diện đã có trên Frontend.
     */
    Page<ItemResponse> getMyFavorites(int page, int size);

    /**
     * Kiểm tra nhanh xem món đồ này đã bị user like chưa (để render trạng thái tim trên Frontend).
     */
    boolean isFavoritedByMe(Long itemId);
}
