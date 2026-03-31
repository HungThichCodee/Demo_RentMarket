package com.example.product.service.impl;

import com.example.product.config.JwtUtils;
import com.example.product.dto.response.ItemResponse;
import com.example.product.entity.Favorite;
import com.example.product.entity.Item;
import com.example.product.exception.AppException;
import com.example.product.exception.ErrorCode;
import com.example.product.mapper.ItemMapper;
import com.example.product.repository.FavoriteRepository;
import com.example.product.repository.ItemRepository;
import com.example.product.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Triển khai dịch vụ Danh sách yêu thích (PERSON-263).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final JwtUtils jwtUtils;

    // =========================================================================
    // Thêm Yêu Thích
    // =========================================================================

    @Override
    @Transactional
    public void addFavorite(Long itemId) {
        String currentUser = jwtUtils.getCurrentUserId();
        log.info("Thêm món đồ ID {} vào yêu thích bởi user {}", itemId, currentUser);

        // Ném lỗi 404 nếu Item mồ côi
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND));

        // Kiểm tra xem đã like chưa
        boolean alreadyLiked = favoriteRepository.existsByUserIdAndItemId(currentUser, itemId);
        if (alreadyLiked) {
            log.warn("Món đồ {} đã nằm trong danh sách yêu thích của {}", itemId, currentUser);
            return; // Im lặng bỏ qua thay vì lỗi (Idempotent)
        }

        // Lưu
        Favorite favorite = Favorite.builder()
                .userId(currentUser)
                .item(item)
                .build();
        favoriteRepository.save(favorite);
    }

    // =========================================================================
    // Xoá Yêu Thích
    // =========================================================================

    @Override
    @Transactional
    public void removeFavorite(Long itemId) {
        String currentUser = jwtUtils.getCurrentUserId();
        log.info("Xoá món đồ ID {} khỏi yêu thích bởi user {}", itemId, currentUser);

        favoriteRepository.findByUserIdAndItemId(currentUser, itemId)
                .ifPresent(favoriteRepository::delete);
    }

    // =========================================================================
    // Xem Danh Sách & Tiện ích
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getMyFavorites(int page, int size) {
        String currentUser = jwtUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);

        // Trả về Page<Favorite> sắp xếp mới nhất
        Page<Favorite> favoritePage = favoriteRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser, pageable);

        // Map sang Page<ItemResponse>
        return favoritePage.map(fav -> {
            Item item = fav.getItem();
            ItemResponse response = itemMapper.toItemResponse(item);
            
            // Do getMyFavorites dành riêng cho MÌNH gọi, nên cột isFavoritedByMe chắc chắn phải = true
            response.setIsFavoritedByMe(true);
            
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavoritedByMe(Long itemId) {
        try {
            String currentUser = jwtUtils.getCurrentUserId();
            return favoriteRepository.existsByUserIdAndItemId(currentUser, itemId);
        } catch (Exception e) {
            // Trường hợp user không đăng nhập
            return false;
        }
    }
}
