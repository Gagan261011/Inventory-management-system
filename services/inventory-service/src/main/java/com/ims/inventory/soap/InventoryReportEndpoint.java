package com.ims.inventory.soap;

import com.ims.inventory.entity.StockLevel;
import com.ims.inventory.entity.StockMovement;
import com.ims.inventory.entity.Warehouse;
import com.ims.inventory.repository.StockLevelRepository;
import com.ims.inventory.repository.StockMovementRepository;
import com.ims.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Endpoint
@RequiredArgsConstructor
@Slf4j
public class InventoryReportEndpoint {

    private static final String NAMESPACE_URI = "http://ims.com/inventory/soap";

    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository movementRepository;
    private final WarehouseRepository warehouseRepository;

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getStockReportRequest")
    @ResponsePayload
    public SoapTypes.GetStockReportResponse getStockReport(
            @RequestPayload SoapTypes.GetStockReportRequest request) {
        
        log.info("SOAP: getStockReport called for warehouse: {}, from: {}, to: {}", 
                request.getWarehouseId(), request.getFromDate(), request.getToDate());

        SoapTypes.GetStockReportResponse response = new SoapTypes.GetStockReportResponse();
        response.setWarehouseId(request.getWarehouseId());
        response.setFromDate(request.getFromDate());
        response.setToDate(request.getToDate());
        response.setReportDate(LocalDateTime.now());

        // Get warehouse info
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElse(null);
        if (warehouse != null) {
            response.setWarehouseName(warehouse.getName());
        }

        // Get stock positions
        List<StockLevel> stockLevels = stockLevelRepository.findByWarehouseId(request.getWarehouseId());
        for (StockLevel stock : stockLevels) {
            SoapTypes.StockPosition position = new SoapTypes.StockPosition();
            position.setItemId(stock.getItemId());
            position.setSku(stock.getItemSku());
            position.setItemName(stock.getItemName());
            position.setCurrentQuantity(stock.getQuantity());
            position.setMinStockLevel(stock.getMinStockLevel());
            position.setMaxStockLevel(stock.getMaxStockLevel());
            position.setUnitPrice(BigDecimal.ZERO); // Would get from catalog service
            position.setStockValue(BigDecimal.ZERO);
            
            if (stock.getQuantity() <= 0) {
                position.setStatus("OUT_OF_STOCK");
            } else if (stock.getQuantity() <= stock.getMinStockLevel()) {
                position.setStatus("LOW");
            } else if (stock.getQuantity() >= stock.getMaxStockLevel()) {
                position.setStatus("OVERSTOCKED");
            } else {
                position.setStatus("NORMAL");
            }
            
            response.getStockPositions().add(position);
        }

        // Calculate movement summary
        LocalDateTime fromDateTime = request.getFromDate().atStartOfDay();
        LocalDateTime toDateTime = request.getToDate().atTime(LocalTime.MAX);
        
        List<StockMovement> movements = movementRepository.findByWarehouseAndDateRange(
                request.getWarehouseId(), fromDateTime, toDateTime);

        SoapTypes.MovementSummary summary = new SoapTypes.MovementSummary();
        int totalInbound = 0;
        int totalOutbound = 0;
        int totalAdjustments = 0;
        BigDecimal inboundValue = BigDecimal.ZERO;
        BigDecimal outboundValue = BigDecimal.ZERO;

        for (StockMovement movement : movements) {
            switch (movement.getMovementType()) {
                case GOODS_RECEIPT, TRANSFER_IN, RETURN -> {
                    totalInbound += movement.getQuantity();
                    if (movement.getTotalValue() != null) {
                        inboundValue = inboundValue.add(movement.getTotalValue());
                    }
                }
                case STOCK_ISSUE, TRANSFER_OUT, DAMAGE, WRITE_OFF -> {
                    totalOutbound += movement.getQuantity();
                    if (movement.getTotalValue() != null) {
                        outboundValue = outboundValue.add(movement.getTotalValue());
                    }
                }
                case ADJUSTMENT -> totalAdjustments += movement.getQuantity();
            }
        }

        summary.setTotalInbound(totalInbound);
        summary.setTotalOutbound(totalOutbound);
        summary.setTotalAdjustments(totalAdjustments);
        summary.setInboundValue(inboundValue);
        summary.setOutboundValue(outboundValue);
        response.setMovementSummary(summary);

        log.info("SOAP: Stock report generated with {} positions", response.getStockPositions().size());
        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getLowStockItemsRequest")
    @ResponsePayload
    public SoapTypes.GetLowStockItemsResponse getLowStockItems(
            @RequestPayload SoapTypes.GetLowStockItemsRequest request) {
        
        log.info("SOAP: getLowStockItems called for warehouse: {}", request.getWarehouseId());

        SoapTypes.GetLowStockItemsResponse response = new SoapTypes.GetLowStockItemsResponse();

        List<StockLevel> lowStockItems;
        if (request.getWarehouseId() != null) {
            lowStockItems = stockLevelRepository.findLowStockItemsByWarehouse(request.getWarehouseId());
        } else {
            lowStockItems = stockLevelRepository.findLowStockItems();
        }

        for (StockLevel stock : lowStockItems) {
            SoapTypes.StockPosition position = new SoapTypes.StockPosition();
            position.setItemId(stock.getItemId());
            position.setSku(stock.getItemSku());
            position.setItemName(stock.getItemName());
            position.setCurrentQuantity(stock.getQuantity());
            position.setMinStockLevel(stock.getMinStockLevel());
            position.setMaxStockLevel(stock.getMaxStockLevel());
            position.setStatus(stock.getQuantity() <= 0 ? "OUT_OF_STOCK" : "LOW");
            response.getLowStockItems().add(position);
        }

        response.setTotalCount(lowStockItems.size());

        log.info("SOAP: Found {} low stock items", response.getTotalCount());
        return response;
    }
}
