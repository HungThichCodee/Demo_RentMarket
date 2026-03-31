package com.example.product.repository;

import com.example.product.dto.request.ItemSearchCriteria;
import com.example.product.entity.Item;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds JPA {@link Specification} instances for dynamic {@link Item} queries
 * based on search criteria provided by the client.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ItemSpecification {

    /**
     * Creates a composite specification that filters items by keyword, category,
     * price range, and status — all optional.
     *
     * @param criteria the search filter criteria (nullable fields are skipped)
     * @return a JPA Specification for use with {@code ItemRepository.findAll()}
     */
    public static Specification<Item> filterBy(ItemSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getKeyword() != null && !criteria.getKeyword().trim().isEmpty()) {
                String likePattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            if (criteria.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), criteria.getCategoryId()));
            }

            if (criteria.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), criteria.getMinPrice()));
            }

            if (criteria.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), criteria.getMaxPrice()));
            }

            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
