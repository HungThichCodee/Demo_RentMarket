package com.example.product.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO chứa thông tin tóm tắt về chủ sở hữu sản phẩm.
 * Được đính kèm vào ItemResponse để người thuê có thể liên hệ.
 * Dữ liệu được lấy best-effort từ Identity-service.
 */
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
