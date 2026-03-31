package com.example.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItemResponse {
    Long id;
    String name;
    String description;
    Double pricePerDay;
    String status;
    String ownerId;
    OwnerInfoResponse owner;
    CategoryResponse category;
    List<ItemImageResponse> images;
    Long viewCount;
    Integer quantity;
    Boolean isFavoritedByMe;
    LocalDateTime createdAt;
}
