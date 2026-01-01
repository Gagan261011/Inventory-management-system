package com.ims.catalog.graphql;

import com.ims.catalog.dto.*;
import com.ims.catalog.service.CategoryService;
import com.ims.catalog.service.ItemService;
import com.ims.catalog.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class CatalogGraphQLController {

    private final ItemService itemService;
    private final CategoryService categoryService;
    private final SupplierService supplierService;

    // ==================== Queries ====================

    @QueryMapping
    public Map<String, Object> items(@Argument Integer page, @Argument Integer size) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        Page<ItemResponse> itemPage = itemService.getAllItems(pageNum, pageSize);
        
        Map<String, Object> result = new HashMap<>();
        result.put("content", itemPage.getContent());
        result.put("totalElements", itemPage.getTotalElements());
        result.put("totalPages", itemPage.getTotalPages());
        result.put("number", itemPage.getNumber());
        result.put("size", itemPage.getSize());
        
        return result;
    }

    @QueryMapping
    public ItemResponse item(@Argument Long id) {
        return itemService.getItemById(id);
    }

    @QueryMapping
    public ItemResponse itemBySku(@Argument String sku) {
        return itemService.getItemBySku(sku);
    }

    @QueryMapping
    public List<ItemResponse> searchItems(@Argument String text, 
                                          @Argument Long categoryId,
                                          @Argument Integer minStock,
                                          @Argument Integer maxStock) {
        log.info("GraphQL searchItems: text={}, categoryId={}", text, categoryId);
        return itemService.searchItems(text, categoryId);
    }

    @QueryMapping
    public List<CategoryResponse> categories() {
        return categoryService.getAllCategories();
    }

    @QueryMapping
    public CategoryResponse category(@Argument Long id) {
        return categoryService.getCategoryById(id);
    }

    @QueryMapping
    public List<SupplierResponse> suppliers() {
        return supplierService.getAllSuppliers();
    }

    @QueryMapping
    public SupplierResponse supplier(@Argument Long id) {
        return supplierService.getSupplierById(id);
    }

    // ==================== Mutations ====================

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ItemResponse createItem(@Argument("input") CreateItemInput input) {
        log.info("GraphQL createItem: {}", input.getSku());
        
        CreateItemRequest request = new CreateItemRequest();
        request.setSku(input.getSku());
        request.setName(input.getName());
        request.setDescription(input.getDescription());
        request.setCategoryId(input.getCategoryId());
        request.setSupplierId(input.getSupplierId());
        request.setUnitPrice(input.getUnitPrice());
        request.setMinStockLevel(input.getMinStockLevel() != null ? input.getMinStockLevel() : 10);
        request.setMaxStockLevel(input.getMaxStockLevel() != null ? input.getMaxStockLevel() : 1000);
        request.setReorderPoint(input.getReorderPoint() != null ? input.getReorderPoint() : 20);
        request.setUnitOfMeasure(input.getUnitOfMeasure() != null ? input.getUnitOfMeasure() : "UNIT");
        
        return itemService.createItem(request);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ItemResponse updateItem(@Argument Long id, @Argument("input") UpdateItemInput input) {
        UpdateItemRequest request = new UpdateItemRequest();
        request.setName(input.getName());
        request.setDescription(input.getDescription());
        request.setCategoryId(input.getCategoryId());
        request.setSupplierId(input.getSupplierId());
        request.setUnitPrice(input.getUnitPrice());
        request.setMinStockLevel(input.getMinStockLevel());
        request.setMaxStockLevel(input.getMaxStockLevel());
        request.setReorderPoint(input.getReorderPoint());
        request.setUnitOfMeasure(input.getUnitOfMeasure());
        request.setActive(input.getActive());
        
        return itemService.updateItem(id, request);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteItem(@Argument Long id) {
        itemService.deleteItem(id);
        return true;
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ItemResponse updateItemStockThreshold(@Argument Long id, 
                                                  @Argument Integer minStock, 
                                                  @Argument Integer maxStock) {
        return itemService.updateStockThreshold(id, minStock, maxStock);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(@Argument("input") CreateCategoryInput input) {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName(input.getName());
        request.setDescription(input.getDescription());
        return categoryService.createCategory(request);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SupplierResponse createSupplier(@Argument("input") CreateSupplierInput input) {
        CreateSupplierRequest request = new CreateSupplierRequest();
        request.setName(input.getName());
        request.setContactPerson(input.getContactPerson());
        request.setEmail(input.getEmail());
        request.setPhone(input.getPhone());
        request.setAddress(input.getAddress());
        return supplierService.createSupplier(request);
    }

    // ==================== Input DTOs ====================

    @lombok.Data
    public static class CreateItemInput {
        private String sku;
        private String name;
        private String description;
        private Long categoryId;
        private Long supplierId;
        private BigDecimal unitPrice;
        private Integer minStockLevel;
        private Integer maxStockLevel;
        private Integer reorderPoint;
        private String unitOfMeasure;
    }

    @lombok.Data
    public static class UpdateItemInput {
        private String name;
        private String description;
        private Long categoryId;
        private Long supplierId;
        private BigDecimal unitPrice;
        private Integer minStockLevel;
        private Integer maxStockLevel;
        private Integer reorderPoint;
        private String unitOfMeasure;
        private Boolean active;
    }

    @lombok.Data
    public static class CreateCategoryInput {
        private String name;
        private String description;
    }

    @lombok.Data
    public static class CreateSupplierInput {
        private String name;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
    }
}
