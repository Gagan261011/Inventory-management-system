package com.ims.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLevelResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private Integer quantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private String status; // NORMAL, LOW, OUT_OF_STOCK, OVERSTOCKED
    private LocalDateTime lastUpdated;
}
