package com.ims.catalog.service;

import com.ims.catalog.dto.*;
import com.ims.catalog.entity.Category;
import com.ims.catalog.entity.Item;
import com.ims.catalog.entity.Supplier;
import com.ims.catalog.repository.CategoryRepository;
import com.ims.catalog.repository.ItemRepository;
import com.ims.catalog.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public Page<ItemResponse> getAllItems(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return itemRepository.findByActiveTrue(pageable).map(this::mapToResponse);
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return mapToResponse(item);
    }

    public ItemResponse getItemBySku(String sku) {
        Item item = itemRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Item not found with SKU: " + sku));
        return mapToResponse(item);
    }

    public List<ItemResponse> searchItems(String text, Long categoryId) {
        return itemRepository.searchItems(text, categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<ItemResponse> searchByText(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return itemRepository.searchByText(search, pageable).map(this::mapToResponse);
    }

    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        log.info("Creating item with SKU: {}", request.getSku());
        
        if (itemRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Item with SKU already exists: " + request.getSku());
        }

        Item item = Item.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .minStockLevel(request.getMinStockLevel())
                .maxStockLevel(request.getMaxStockLevel())
                .reorderPoint(request.getReorderPoint())
                .unitOfMeasure(request.getUnitOfMeasure())
                .active(true)
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            item.setSupplier(supplier);
        }

        Item savedItem = itemRepository.save(item);
        log.info("Item created: {}", savedItem.getSku());
        return mapToResponse(savedItem);
    }

    @Transactional
    public ItemResponse updateItem(Long id, UpdateItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        if (request.getMinStockLevel() != null) item.setMinStockLevel(request.getMinStockLevel());
        if (request.getMaxStockLevel() != null) item.setMaxStockLevel(request.getMaxStockLevel());
        if (request.getReorderPoint() != null) item.setReorderPoint(request.getReorderPoint());
        if (request.getUnitOfMeasure() != null) item.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getActive() != null) item.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            item.setSupplier(supplier);
        }

        Item updatedItem = itemRepository.save(item);
        log.info("Item updated: {}", updatedItem.getSku());
        return mapToResponse(updatedItem);
    }

    @Transactional
    public ItemResponse updateStockThreshold(Long id, Integer minStock, Integer maxStock) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        
        item.setMinStockLevel(minStock);
        item.setMaxStockLevel(maxStock);
        
        Item updatedItem = itemRepository.save(item);
        log.info("Stock threshold updated for item: {}", updatedItem.getSku());
        return mapToResponse(updatedItem);
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        item.setActive(false);
        itemRepository.save(item);
        log.info("Item deactivated: {}", item.getSku());
    }

    private ItemResponse mapToResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .sku(item.getSku())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory() != null ? mapCategoryResponse(item.getCategory()) : null)
                .supplier(item.getSupplier() != null ? mapSupplierResponse(item.getSupplier()) : null)
                .unitPrice(item.getUnitPrice())
                .minStockLevel(item.getMinStockLevel())
                .maxStockLevel(item.getMaxStockLevel())
                .reorderPoint(item.getReorderPoint())
                .unitOfMeasure(item.getUnitOfMeasure())
                .active(item.isActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private CategoryResponse mapCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }

    private SupplierResponse mapSupplierResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .active(supplier.isActive())
                .build();
    }
}
