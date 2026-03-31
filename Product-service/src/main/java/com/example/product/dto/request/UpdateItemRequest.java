package com.example.product.dto.request;

import com.example.product.entity.ItemStatus;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateItemRequest {

    String name;

    String description;

    @Min(value = 0, message = "Price per day must be at least 0")
    Double pricePerDay;

    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity;

    ItemStatus status;

    Long categoryId;
}

