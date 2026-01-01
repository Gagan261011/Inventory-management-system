package com.ims.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateItemRequest {
    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private Long categoryId;

    private Long supplierId;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    private Integer minStockLevel = 10;
    private Integer maxStockLevel = 1000;
    private Integer reorderPoint = 20;
    private String unitOfMeasure = "UNIT";
}
