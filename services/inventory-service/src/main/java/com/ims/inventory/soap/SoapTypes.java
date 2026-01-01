package com.ims.inventory.soap;

import jakarta.xml.bind.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SoapTypes {

    @Data
    @XmlRootElement(name = "getStockReportRequest", namespace = "http://ims.com/inventory/soap")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class GetStockReportRequest {
        private Long warehouseId;
        private LocalDate fromDate;
        private LocalDate toDate;
    }

    @Data
    @XmlRootElement(name = "getStockReportResponse", namespace = "http://ims.com/inventory/soap")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class GetStockReportResponse {
        private Long warehouseId;
        private String warehouseName;
        private LocalDateTime reportDate;
        private LocalDate fromDate;
        private LocalDate toDate;
        @XmlElement(name = "stockPositions")
        private List<StockPosition> stockPositions = new ArrayList<>();
        private MovementSummary movementSummary;
    }

    @Data
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class StockPosition {
        private Long itemId;
        private String sku;
        private String itemName;
        private Integer currentQuantity;
        private Integer minStockLevel;
        private Integer maxStockLevel;
        private BigDecimal unitPrice;
        private BigDecimal stockValue;
        private String status;
    }

    @Data
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class MovementSummary {
        private Integer totalInbound;
        private Integer totalOutbound;
        private Integer totalAdjustments;
        private BigDecimal inboundValue;
        private BigDecimal outboundValue;
    }

    @Data
    @XmlRootElement(name = "getLowStockItemsRequest", namespace = "http://ims.com/inventory/soap")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class GetLowStockItemsRequest {
        private Long warehouseId;
    }

    @Data
    @XmlRootElement(name = "getLowStockItemsResponse", namespace = "http://ims.com/inventory/soap")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class GetLowStockItemsResponse {
        @XmlElement(name = "lowStockItems")
        private List<StockPosition> lowStockItems = new ArrayList<>();
        private Integer totalCount;
    }
}
