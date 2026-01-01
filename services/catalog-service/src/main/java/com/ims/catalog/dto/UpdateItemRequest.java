package com.ims.catalog.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateItemRequest {
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
