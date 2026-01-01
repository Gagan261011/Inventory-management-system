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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/replenishments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Replenishment Requests", description = "Replenishment request management")
@SecurityRequirement(name = "bearerAuth")
public class ReplenishmentController {

    private final StockService stockService;

    @PostMapping
    @Operation(summary = "Create replenishment request")
    public ResponseEntity<ReplenishmentRequestResponse> createRequest(
            @Valid @RequestBody CreateReplenishmentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = 1L; // Extract from JWT in real app
        
        log.info("Creating replenishment request by user: {}", email);
        return ResponseEntity.ok(stockService.createReplenishmentRequest(request, userId, email));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending replenishment requests (Admin only)")
    public ResponseEntity<Page<ReplenishmentRequestResponse>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(stockService.getPendingReplenishments(page, size));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my replenishment requests")
    public ResponseEntity<Page<ReplenishmentRequestResponse>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = 1L; // Extract from JWT
        return ResponseEntity.ok(stockService.getReplenishmentsByUser(userId, page, size));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve replenishment request (Admin only)")
    public ResponseEntity<ReplenishmentRequestResponse> approveRequest(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = 1L; // Extract from JWT
        
        log.info("Approving replenishment request {} by admin: {}", id, email);
        return ResponseEntity.ok(stockService.approveReplenishment(id, userId, email));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject replenishment request (Admin only)")
    public ResponseEntity<ReplenishmentRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody ApprovalRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = 1L; // Extract from JWT
        
        log.info("Rejecting replenishment request {} by admin: {}, reason: {}", id, email, request.getReason());
        return ResponseEntity.ok(stockService.rejectReplenishment(id, request.getReason(), userId, email));
    }
}
