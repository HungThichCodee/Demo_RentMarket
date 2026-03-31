package com.example.product.dto.request;

import com.example.product.entity.ItemStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItemSearchCriteria {
    String keyword;
    Long categoryId;
    Double minPrice;
    Double maxPrice;
    ItemStatus status;
}
