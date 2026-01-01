package com.ims.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalSkus;
    private BigDecimal totalStockValue;
    private long lowStockCount;
    private long outOfStockCount;
    private long pendingReplenishments;
    private long recentMovementsCount;
    private List<StockLevelResponse> lowStockItems;
    private List<StockMovementResponse> recentMovements;
}
