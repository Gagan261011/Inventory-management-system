package com.ims.inventory.dto;

import com.ims.inventory.entity.StockMovement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMovementRequest {
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;
    
    @NotNull(message = "Item ID is required")
    private Long itemId;
    
    private String itemSku;
    
    @NotNull(message = "Movement type is required")
    private StockMovement.MovementType movementType;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    private BigDecimal unitPrice;
    
    private String referenceNumber;
    private String referenceType; // PO, INVOICE, TRANSFER, etc.
    private String reason;
    private String notes;
}
