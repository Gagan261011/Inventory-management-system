package com.ims.inventory.dto;

import com.ims.inventory.entity.ReplenishmentRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateReplenishmentRequest {
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;
    
    @NotNull(message = "Item ID is required")
    private Long itemId;
    
    private String itemSku;
    private String itemName;
    
    @NotNull(message = "Requested quantity is required")
    @Positive(message = "Requested quantity must be positive")
    private Integer requestedQuantity;
    
    private ReplenishmentRequest.Priority priority;
    private String notes;
}
