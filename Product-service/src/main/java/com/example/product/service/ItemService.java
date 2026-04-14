package com.example.product.service;

import com.example.product.config.JwtUtils;
import com.example.product.dto.request.CreateItemRequest;
import com.example.product.dto.request.ItemSearchCriteria;
import com.example.product.dto.request.UpdateItemRequest;
import com.example.product.dto.response.ApiResponse;
import com.example.product.dto.response.ItemImageResponse;
import com.example.product.dto.response.ItemResponse;
import com.example.product.dto.response.OwnerInfoResponse;
import com.example.product.dto.response.PageResponse;
import com.example.product.entity.Category;
import com.example.product.entity.Item;
import com.example.product.entity.ItemImage;
import com.example.product.entity.ItemStatus;
import com.example.product.exception.AppException;
import com.example.product.exception.ErrorCode;
import com.example.product.mapper.ItemImageMapper;
import com.example.product.mapper.ItemMapper;
import com.example.product.repository.CategoryRepository;
import com.example.product.repository.ItemImageRepository;
import com.example.product.repository.ItemRepository;
import com.example.product.repository.ItemSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final ItemMapper itemMapper;
    private final ItemImageRepository itemImageRepository;
    private final FileStorageService fileStorageService;
    private final ItemImageMapper itemImageMapper;
    private final RestTemplate restTemplate;
    private final JwtUtils jwtUtils;
    private final FavoriteService favoriteService;

    @Value("${app.identity-service.url:http://identity-service:8080/identity/users}")
    private String identityServiceUrl;

    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        String ownerId = jwtUtils.getCurrentUserId();
        Category category = findCategoryById(request.getCategoryId());

        Item item = itemMapper.toItem(request);
        item.setOwnerId(ownerId);
        item.setCategory(category);

        return itemMapper.toItemResponse(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse updateItem(Long id, UpdateItemRequest request) {
        String requestingUserId = jwtUtils.getCurrentUserId();
        Item item = findItemById(id);
        verifyOwnership(item, requestingUserId);

        if (request.getCategoryId() != null) {
            item.setCategory(findCategoryById(request.getCategoryId()));
        }

        itemMapper.updateItemFromRequest(request, item);
        return itemMapper.toItemResponse(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id) {
        String requestingUserId = jwtUtils.getCurrentUserId();
        Item item = findItemById(id);
        verifyOwnership(item, requestingUserId);

        if (item.getStatus() == ItemStatus.RENTED) {
            throw new AppException(ErrorCode.ITEM_CURRENTLY_RENTED);
        }

        if (item.getImages() != null) {
            for (ItemImage image : item.getImages()) {
                fileStorageService.deleteFile(image.getImageUrl());
            }
        }

        itemRepository.delete(item);
    }

    @Transactional
    public ItemResponse getItemById(Long id) {
        itemRepository.incrementViewCount(id);

        Item item = itemRepository.findWithImagesById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND));

        ItemResponse response = itemMapper.toItemResponse(item);
        response.setOwner(fetchOwnerInfo(item.getOwnerId()));
        response.setIsFavoritedByMe(favoriteService.isFavoritedByMe(id));
        return response;
    }

    @Transactional
    public ItemResponse rentItem(Long id) {
        Item item = findItemById(id);
        if (item.getStatus() == ItemStatus.RENTED) {
            throw new AppException(ErrorCode.ITEM_ALREADY_RENTED);
        }
        item.setStatus(ItemStatus.RENTED);
        return itemMapper.toItemResponse(itemRepository.save(item));
    }

    @Transactional
    public ItemResponse releaseItem(Long id) {
        Item item = findItemById(id);
        item.setStatus(ItemStatus.AVAILABLE);
        return itemMapper.toItemResponse(itemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> searchItems(ItemSearchCriteria criteria,
                                                   int page, int size,
                                                   String sortBy, String sortDir) {
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        Specification<Item> spec = ItemSpecification.filterBy(criteria);
        return toPageResponse(itemRepository.findAll(spec, pageable));
    }

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> getMyItems(int page, int size,
                                                  String sortBy, String sortDir) {
        String ownerId = jwtUtils.getCurrentUserId();
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);
        return toPageResponse(itemRepository.findByOwnerId(ownerId, pageable));
    }

    @Transactional
    public ItemImageResponse uploadItemImage(Long itemId, MultipartFile file) {
        Item item = findItemById(itemId);

        int imageCount = itemImageRepository.countByItemId(itemId);
        if (imageCount >= 5) {
            throw new AppException(ErrorCode.MAX_IMAGES_REACHED);
        }

        String fileName = fileStorageService.storeFile(file);

        ItemImage itemImage = ItemImage.builder()
                .item(item)
                .imageUrl(fileName)
                .build();

        return itemImageMapper.toItemImageResponse(itemImageRepository.save(itemImage));
    }

    private Item findItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    private void verifyOwnership(Item item, String requestingUserId) {
        if (!item.getOwnerId().equals(requestingUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private PageResponse<ItemResponse> toPageResponse(Page<Item> itemPage) {
        return PageResponse.<ItemResponse>builder()
                .currentPage(itemPage.getNumber())
                .totalPages(itemPage.getTotalPages())
                .pageSize(itemPage.getSize())
                .totalElements(itemPage.getTotalElements())
                .data(itemPage.getContent().stream()
                        .map(item -> {
                            ItemResponse res = itemMapper.toItemResponse(item);
                            res.setIsFavoritedByMe(favoriteService.isFavoritedByMe(item.getId()));
                            return res;
                        })
                        .toList())
                .build();
    }

    private OwnerInfoResponse fetchOwnerInfo(String ownerId) {
        OwnerInfoResponse ownerInfo = OwnerInfoResponse.builder()
                .id(ownerId)
                .name("Unknown")
                .rating(0.0)
                .build();

        try {
            String url = identityServiceUrl + "/by-username/" + ownerId;
            ApiResponse<?> apiResponse = restTemplate.getForObject(url, ApiResponse.class);
            if (apiResponse != null && apiResponse.getResult() != null) {
                LinkedHashMap<?, ?> result = (LinkedHashMap<?, ?>) apiResponse.getResult();

                String firstName = (String) result.get("firstName");
                String lastName  = (String) result.get("lastName");
                String username  = (String) result.get("username");

                if (firstName != null || lastName != null) {
                    String fullName = ((firstName != null ? firstName : "").trim()
                            + " " + (lastName != null ? lastName : "").trim()).trim();
                    ownerInfo.setName(fullName.isEmpty() ? username : fullName);
                } else if (username != null) {
                    ownerInfo.setName(username);
                }

                ownerInfo.setPhone((String) result.get("phone"));
                ownerInfo.setAddress((String) result.get("address"));
            }
        } catch (Exception e) {
            log.warn("Không thể lấy thông tin chủ đồ ownerId={}: {}", ownerId, e.getMessage());
        }

        return ownerInfo;
    }
}
