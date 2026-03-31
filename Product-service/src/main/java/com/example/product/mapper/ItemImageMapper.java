package com.example.product.mapper;

import com.example.product.dto.response.ItemImageResponse;
import com.example.product.entity.ItemImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ItemImageMapper {

    @Mapping(source = "item.id", target = "itemId")
    ItemImageResponse toItemImageResponse(ItemImage itemImage);
}
