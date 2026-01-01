package com.ims.inventory.dto;

import com.ims.inventory.entity.StockMovement;
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
public class StockMovementResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private StockMovement.MovementType movementType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalValue;
    private String referenceNumber;
    private String referenceType;
    private String reason;
    private Long createdBy;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private String notes;
}
