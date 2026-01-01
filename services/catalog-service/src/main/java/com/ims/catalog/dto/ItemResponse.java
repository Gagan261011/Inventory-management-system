package com.ims.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private CategoryResponse category;
    private SupplierResponse supplier;
    private BigDecimal unitPrice;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private Integer reorderPoint;
    private String unitOfMeasure;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
