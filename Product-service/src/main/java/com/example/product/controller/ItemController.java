package com.example.product.controller;

import com.example.product.dto.request.CreateItemRequest;
import com.example.product.dto.request.ItemSearchCriteria;
import com.example.product.dto.request.UpdateItemRequest;
import com.example.product.dto.response.ApiResponse;
import com.example.product.dto.response.ItemImageResponse;
import com.example.product.dto.response.ItemResponse;
import com.example.product.dto.response.PageResponse;
import com.example.product.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ApiResponse<ItemResponse> createItem(@Valid @RequestBody CreateItemRequest request) {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.createItem(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ItemResponse> updateItem(@PathVariable Long id, @Valid @RequestBody UpdateItemRequest request) {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.updateItem(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ApiResponse.<String>builder()
                .result("Item has been deleted successfully")
                .build();
    }

    @GetMapping("/my-items")
    public ApiResponse<PageResponse<ItemResponse>> getMyItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .result(itemService.getMyItems(page, size, sortBy, sortDir))
                .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<ItemResponse>> searchItems(
            @ModelAttribute ItemSearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ApiResponse.<PageResponse<ItemResponse>>builder()
                .result(itemService.searchItems(criteria, page, size, sortBy, sortDir))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ItemResponse> getItemById(@PathVariable Long id) {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.getItemById(id))
                .build();
    }

    @PostMapping("/{id}/rent")
    public ApiResponse<ItemResponse> rentItem(@PathVariable Long id) {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.rentItem(id))
                .build();
    }

    @PutMapping("/{id}/release")
    public ApiResponse<ItemResponse> releaseItem(@PathVariable Long id) {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.releaseItem(id))
                .build();
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ItemImageResponse> uploadItemImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ApiResponse.<ItemImageResponse>builder()
                .result(itemService.uploadItemImage(id, file))
                .build();
    }
}
