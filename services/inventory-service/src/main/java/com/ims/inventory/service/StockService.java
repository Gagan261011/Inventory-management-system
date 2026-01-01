package com.ims.inventory.service;

import com.ims.inventory.dto.*;
import com.ims.inventory.entity.ReplenishmentRequest;
import com.ims.inventory.entity.StockLevel;
import com.ims.inventory.entity.StockMovement;
import com.ims.inventory.entity.Warehouse;
import com.ims.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ReplenishmentRequestRepository replenishmentRepository;
    private final WarehouseRepository warehouseRepository;

    // ==================== Stock Levels ====================

    public List<StockLevelResponse> getStockByWarehouse(Long warehouseId) {
        return stockLevelRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToStockResponse)
                .collect(Collectors.toList());
    }

    public List<StockLevelResponse> getLowStockItems() {
        return stockLevelRepository.findLowStockItems().stream()
                .map(this::mapToStockResponse)
                .collect(Collectors.toList());
    }

    public List<StockLevelResponse> getLowStockItemsByWarehouse(Long warehouseId) {
        return stockLevelRepository.findLowStockItemsByWarehouse(warehouseId).stream()
                .map(this::mapToStockResponse)
                .collect(Collectors.toList());
    }

    public StockLevelResponse getStockForItem(Long warehouseId, Long itemId) {
        StockLevel stock = stockLevelRepository.findByWarehouseIdAndItemId(warehouseId, itemId)
                .orElseThrow(() -> new RuntimeException("Stock not found for item in warehouse"));
        return mapToStockResponse(stock);
    }

    // ==================== Stock Movements ====================

    @Transactional
    public StockMovementResponse createMovement(CreateMovementRequest request, Long userId, String userEmail) {
        log.info("Creating stock movement: type={}, itemId={}, qty={}, user={}", 
                request.getMovementType(), request.getItemId(), request.getQuantity(), userEmail);

        // Get or create stock level
        StockLevel stockLevel = stockLevelRepository
                .findByWarehouseIdAndItemId(request.getWarehouseId(), request.getItemId())
                .orElseGet(() -> StockLevel.builder()
                        .warehouseId(request.getWarehouseId())
                        .itemId(request.getItemId())
                        .itemSku(request.getItemSku())
                        .quantity(0)
                        .build());

        // Update stock quantity based on movement type
        int newQuantity = calculateNewQuantity(stockLevel.getQuantity(), request.getMovementType(), request.getQuantity());
        
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock. Current: " + stockLevel.getQuantity() + ", Requested: " + request.getQuantity());
        }

        stockLevel.setQuantity(newQuantity);
        stockLevelRepository.save(stockLevel);

        // Create movement record
        StockMovement movement = StockMovement.builder()
                .warehouseId(request.getWarehouseId())
                .itemId(request.getItemId())
                .itemSku(request.getItemSku())
                .movementType(request.getMovementType())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .referenceNumber(request.getReferenceNumber())
                .referenceType(request.getReferenceType())
                .reason(request.getReason())
                .notes(request.getNotes())
                .createdBy(userId)
                .createdByEmail(userEmail)
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        log.info("Stock movement created: id={}, newStockLevel={}", saved.getId(), newQuantity);

        return mapToMovementResponse(saved);
    }

    private int calculateNewQuantity(int current, StockMovement.MovementType type, int quantity) {
        return switch (type) {
            case GOODS_RECEIPT, TRANSFER_IN, RETURN -> current + quantity;
            case STOCK_ISSUE, TRANSFER_OUT, DAMAGE, WRITE_OFF -> current - quantity;
            case ADJUSTMENT -> quantity; // Set absolute value
        };
    }

    public Page<StockMovementResponse> getMovements(Long warehouseId, String itemSku, 
                                                    LocalDateTime fromDate, LocalDateTime toDate,
                                                    int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return stockMovementRepository.searchMovements(warehouseId, itemSku, fromDate, toDate, pageable)
                .map(this::mapToMovementResponse);
    }

    public Page<StockMovementResponse> getMovementsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return stockMovementRepository.findByCreatedBy(userId, pageable)
                .map(this::mapToMovementResponse);
    }

    public List<StockMovementResponse> getRecentMovements(int count) {
        return stockMovementRepository.findRecentMovements(PageRequest.of(0, count)).stream()
                .map(this::mapToMovementResponse)
                .collect(Collectors.toList());
    }

    // ==================== Replenishment Requests ====================

    @Transactional
    public ReplenishmentRequestResponse createReplenishmentRequest(CreateReplenishmentRequest request, 
                                                                   Long userId, String userEmail) {
        log.info("Creating replenishment request: itemId={}, qty={}, user={}", 
                request.getItemId(), request.getRequestedQuantity(), userEmail);

        // Get current stock level
        StockLevel stockLevel = stockLevelRepository
                .findByWarehouseIdAndItemId(request.getWarehouseId(), request.getItemId())
                .orElse(null);

        ReplenishmentRequest replenishment = ReplenishmentRequest.builder()
                .warehouseId(request.getWarehouseId())
                .itemId(request.getItemId())
                .itemSku(request.getItemSku())
                .itemName(request.getItemName())
                .currentQuantity(stockLevel != null ? stockLevel.getQuantity() : 0)
                .requestedQuantity(request.getRequestedQuantity())
                .status(ReplenishmentRequest.RequestStatus.PENDING)
                .priority(request.getPriority() != null ? request.getPriority() : ReplenishmentRequest.Priority.NORMAL)
                .requestedBy(userId)
                .requestedByEmail(userEmail)
                .notes(request.getNotes())
                .build();

        ReplenishmentRequest saved = replenishmentRepository.save(replenishment);
        log.info("Replenishment request created: id={}", saved.getId());

        return mapToReplenishmentResponse(saved);
    }

    public Page<ReplenishmentRequestResponse> getPendingReplenishments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        return replenishmentRepository.findByStatus(ReplenishmentRequest.RequestStatus.PENDING, pageable)
                .map(this::mapToReplenishmentResponse);
    }

    public Page<ReplenishmentRequestResponse> getReplenishmentsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        return replenishmentRepository.findByRequestedBy(userId, pageable)
                .map(this::mapToReplenishmentResponse);
    }

    @Transactional
    public ReplenishmentRequestResponse approveReplenishment(Long id, Long approvedBy, String approvedByEmail) {
        ReplenishmentRequest request = replenishmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Replenishment request not found: " + id));

        if (request.getStatus() != ReplenishmentRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }

        request.setStatus(ReplenishmentRequest.RequestStatus.APPROVED);
        request.setApprovedBy(approvedBy);
        request.setApprovedByEmail(approvedByEmail);
        request.setApprovedAt(LocalDateTime.now());

        ReplenishmentRequest saved = replenishmentRepository.save(request);
        log.info("Replenishment request approved: id={}, by={}", id, approvedByEmail);

        return mapToReplenishmentResponse(saved);
    }

    @Transactional
    public ReplenishmentRequestResponse rejectReplenishment(Long id, String reason, Long rejectedBy, String rejectedByEmail) {
        ReplenishmentRequest request = replenishmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Replenishment request not found: " + id));

        if (request.getStatus() != ReplenishmentRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Request is not in pending status");
        }

        request.setStatus(ReplenishmentRequest.RequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setApprovedBy(rejectedBy);
        request.setApprovedByEmail(rejectedByEmail);
        request.setApprovedAt(LocalDateTime.now());

        ReplenishmentRequest saved = replenishmentRepository.save(request);
        log.info("Replenishment request rejected: id={}, by={}, reason={}", id, rejectedByEmail, reason);

        return mapToReplenishmentResponse(saved);
    }

    // ==================== Dashboard ====================

    public DashboardResponse getDashboard(Long warehouseId) {
        List<StockLevel> allStock = warehouseId != null 
                ? stockLevelRepository.findByWarehouseId(warehouseId)
                : stockLevelRepository.findAll();

        List<StockLevel> lowStock = warehouseId != null
                ? stockLevelRepository.findLowStockItemsByWarehouse(warehouseId)
                : stockLevelRepository.findLowStockItems();

        long pendingReplenishments = replenishmentRepository.countByStatus(ReplenishmentRequest.RequestStatus.PENDING);
        
        List<StockMovementResponse> recentMovements = getRecentMovements(10);

        BigDecimal totalValue = BigDecimal.ZERO; // Would need unit price from catalog service
        long outOfStock = allStock.stream().filter(s -> s.getQuantity() <= 0).count();

        return DashboardResponse.builder()
                .totalSkus(allStock.size())
                .totalStockValue(totalValue)
                .lowStockCount(lowStock.size())
                .outOfStockCount(outOfStock)
                .pendingReplenishments(pendingReplenishments)
                .recentMovementsCount(recentMovements.size())
                .lowStockItems(lowStock.stream().map(this::mapToStockResponse).collect(Collectors.toList()))
                .recentMovements(recentMovements)
                .build();
    }

    // ==================== Mapping Methods ====================

    private StockLevelResponse mapToStockResponse(StockLevel stock) {
        Warehouse warehouse = warehouseRepository.findById(stock.getWarehouseId()).orElse(null);
        
        String status = "NORMAL";
        if (stock.getQuantity() <= 0) {
            status = "OUT_OF_STOCK";
        } else if (stock.getQuantity() <= stock.getMinStockLevel()) {
            status = "LOW";
        } else if (stock.getQuantity() >= stock.getMaxStockLevel()) {
            status = "OVERSTOCKED";
        }

        return StockLevelResponse.builder()
                .id(stock.getId())
                .warehouseId(stock.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .itemId(stock.getItemId())
                .itemSku(stock.getItemSku())
                .itemName(stock.getItemName())
                .quantity(stock.getQuantity())
                .reservedQuantity(stock.getReservedQuantity())
                .availableQuantity(stock.getAvailableQuantity())
                .minStockLevel(stock.getMinStockLevel())
                .maxStockLevel(stock.getMaxStockLevel())
                .status(status)
                .lastUpdated(stock.getLastUpdated())
                .build();
    }

    private StockMovementResponse mapToMovementResponse(StockMovement movement) {
        Warehouse warehouse = warehouseRepository.findById(movement.getWarehouseId()).orElse(null);
        
        return StockMovementResponse.builder()
                .id(movement.getId())
                .warehouseId(movement.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .itemId(movement.getItemId())
                .itemSku(movement.getItemSku())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .unitPrice(movement.getUnitPrice())
                .totalValue(movement.getTotalValue())
                .referenceNumber(movement.getReferenceNumber())
                .referenceType(movement.getReferenceType())
                .reason(movement.getReason())
                .createdBy(movement.getCreatedBy())
                .createdByEmail(movement.getCreatedByEmail())
                .createdAt(movement.getCreatedAt())
                .notes(movement.getNotes())
                .build();
    }

    private ReplenishmentRequestResponse mapToReplenishmentResponse(ReplenishmentRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId()).orElse(null);
        
        return ReplenishmentRequestResponse.builder()
                .id(request.getId())
                .warehouseId(request.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .itemId(request.getItemId())
                .itemSku(request.getItemSku())
                .itemName(request.getItemName())
                .currentQuantity(request.getCurrentQuantity())
                .requestedQuantity(request.getRequestedQuantity())
                .status(request.getStatus())
                .requestedBy(request.getRequestedBy())
                .requestedByEmail(request.getRequestedByEmail())
                .requestedAt(request.getRequestedAt())
                .approvedBy(request.getApprovedBy())
                .approvedByEmail(request.getApprovedByEmail())
                .approvedAt(request.getApprovedAt())
                .notes(request.getNotes())
                .rejectionReason(request.getRejectionReason())
                .priority(request.getPriority())
                .build();
    }
}
