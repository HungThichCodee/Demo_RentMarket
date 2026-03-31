package com.example.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateItemRequest {
    @NotBlank(message = "Name must not be blank")
    String name;

    @NotNull(message = "Description must not be null")
    String description;

    @NotNull(message = "Price per day must not be null")
    @Min(value = 0, message = "Price per day must be at least 0")
    Double pricePerDay;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Builder.Default
    Integer quantity = 1;

    @NotNull(message = "Category ID must not be null")
    Long categoryId;
}

