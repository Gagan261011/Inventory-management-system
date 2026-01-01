package com.ims.inventory.dto;

import com.ims.inventory.entity.ReplenishmentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplenishmentRequestResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long itemId;
    private String itemSku;
    private String itemName;
    private Integer currentQuantity;
    private Integer requestedQuantity;
    private ReplenishmentRequest.RequestStatus status;
    private Long requestedBy;
    private String requestedByEmail;
    private LocalDateTime requestedAt;
    private Long approvedBy;
    private String approvedByEmail;
    private LocalDateTime approvedAt;
    private String notes;
    private String rejectionReason;
    private ReplenishmentRequest.Priority priority;
}
