package com.example.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OwnerInfoResponse {
    String id;
    String name;
    Double rating;
    String phone;
    String address;
}
