package com.example.review.mapper;

import com.example.review.dto.response.ReviewResponse;
import com.example.review.entity.Review;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper chuyển đổi Review entity → ReviewResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface ReviewMapper {

    ReviewResponse toReviewResponse(Review review);
}
