package com.example.product.controller;

import com.example.product.dto.response.ApiResponse;
import com.example.product.dto.response.ItemResponse;
import com.example.product.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{itemId}")
    public ApiResponse<String> addFavorite(@PathVariable Long itemId) {
        favoriteService.addFavorite(itemId);
        return ApiResponse.<String>builder()
                .result("Đã thêm món đồ vào danh sách yêu thích")
                .build();
    }

    @DeleteMapping("/{itemId}")
    public ApiResponse<String> removeFavorite(@PathVariable Long itemId) {
        favoriteService.removeFavorite(itemId);
        return ApiResponse.<String>builder()
                .result("Đã bỏ món đồ khỏi danh sách yêu thích")
                .build();
    }

    @GetMapping
    public ApiResponse<Page<ItemResponse>> getMyFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.<Page<ItemResponse>>builder()
                .result(favoriteService.getMyFavorites(page, size))
                .build();
    }
}
