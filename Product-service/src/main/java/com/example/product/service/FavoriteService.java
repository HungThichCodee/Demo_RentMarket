package com.example.product.service;

import com.example.product.dto.response.ItemResponse;
import org.springframework.data.domain.Page;

public interface FavoriteService {

    void addFavorite(Long itemId);

    void removeFavorite(Long itemId);

    Page<ItemResponse> getMyFavorites(int page, int size);

    boolean isFavoritedByMe(Long itemId);
}
