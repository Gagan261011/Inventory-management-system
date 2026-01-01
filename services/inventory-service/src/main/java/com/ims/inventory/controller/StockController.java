package com.ims.inventory.controller;

import com.ims.inventory.dto.*;
import com.ims.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Management", description = "Stock levels and movements")
@SecurityRequirement(name = "bearerAuth")
public class StockController {

    private final StockService stockService;

    // ==================== Stock Levels ====================

    @GetMapping("/stock")
    @Operation(summary = "Get stock levels by warehouse")
    public ResponseEntity<List<StockLevelResponse>> getStock(
            @RequestParam(required = false) Long warehouseId) {
        if (warehouseId != null) {
            return ResponseEntity.ok(stockService.getStockByWarehouse(warehouseId));
        }
        return ResponseEntity.ok(stockService.getLowStockItems()); // Default to low stock
    }

    @GetMapping("/stock/low")
    @Operation(summary = "Get low stock items")
    public ResponseEntity<List<StockLevelResponse>> getLowStock(
            @RequestParam(required = false) Long warehouseId) {
        if (warehouseId != null) {
            return ResponseEntity.ok(stockService.getLowStockItemsByWarehouse(warehouseId));
        }
        return ResponseEntity.ok(stockService.getLowStockItems());
    }

    @GetMapping("/stock/{warehouseId}/{itemId}")
    @Operation(summary = "Get stock for specific item in warehouse")
    public ResponseEntity<StockLevelResponse> getStockForItem(
            @PathVariable Long warehouseId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(stockService.getStockForItem(warehouseId, itemId));
    }

    // ==================== Stock Movements ====================

    @PostMapping("/movements")
    @Operation(summary = "Create stock movement (Goods Receipt / Stock Issue)")
    public ResponseEntity<StockMovementResponse> createMovement(
            @Valid @RequestBody CreateMovementRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = getUserIdFromAuth(auth);
        
        log.info("Creating movement for user: {}", email);
        return ResponseEntity.ok(stockService.createMovement(request, userId, email));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get stock movements with filters")
    public ResponseEntity<Page<StockMovementResponse>> getMovements(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String itemSku,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(stockService.getMovements(warehouseId, itemSku, fromDate, toDate, page, size));
    }

    @GetMapping("/movements/my")
    @Operation(summary = "Get my stock movements")
    public ResponseEntity<Page<StockMovementResponse>> getMyMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(stockService.getMovementsByUser(userId, page, size));
    }

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard data")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(stockService.getDashboard(warehouseId));
    }

    // ==================== Admin Reports ====================

    @GetMapping("/admin/reports/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get low stock report (Admin only)")
    public ResponseEntity<List<StockLevelResponse>> getLowStockReport() {
        return ResponseEntity.ok(stockService.getLowStockItems());
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // In a real app, extract from JWT claims
        // For now, return a default value
        return 1L;
    }
}
