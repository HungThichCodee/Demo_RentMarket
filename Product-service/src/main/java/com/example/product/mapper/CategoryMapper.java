package com.example.product.mapper;

import com.example.product.dto.request.CreateCategoryRequest;
import com.example.product.dto.request.UpdateCategoryRequest;
import com.example.product.dto.response.CategoryResponse;
import com.example.product.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CategoryMapper {

    @org.mapstruct.Mapping(target = "parent", ignore = true)
    @org.mapstruct.Mapping(target = "children", ignore = true)
    Category toCategory(CreateCategoryRequest request);

    @org.mapstruct.Mapping(target = "parentId", source = "parent.id")
    CategoryResponse toCategoryResponse(Category category);

    @org.mapstruct.Mapping(target = "parent", ignore = true)
    @org.mapstruct.Mapping(target = "children", ignore = true)
    void updateCategory(@MappingTarget Category category, UpdateCategoryRequest request);
}
