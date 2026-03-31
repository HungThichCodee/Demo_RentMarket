package com.example.product.mapper;

import com.example.product.dto.request.CreateItemRequest;
import com.example.product.dto.request.UpdateItemRequest;
import com.example.product.dto.response.ItemResponse;
import com.example.product.entity.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring", 
    uses = {CategoryMapper.class, ItemImageMapper.class}, 
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE
)
public interface ItemMapper {

    @Mapping(target = "category", ignore = true)
    Item toItem(CreateItemRequest request);

    @Mapping(target = "category", ignore = true)
    void updateItemFromRequest(UpdateItemRequest request, @MappingTarget Item item);

    @Mapping(target = "owner", ignore = true)
    ItemResponse toItemResponse(Item item);
}
