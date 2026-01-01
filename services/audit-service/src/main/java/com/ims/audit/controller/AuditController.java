package com.ims.audit.controller;

import com.ims.audit.dto.*;
import com.ims.audit.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit", description = "Audit event management APIs")
public class AuditController {
    
    private final AuditService auditService;
    
    @PostMapping("/events")
    @Operation(summary = "Create audit event", description = "Log a new audit event (internal use)")
    public ResponseEntity<AuditEventResponse> createAuditEvent(@RequestBody CreateAuditEventRequest request) {
        log.debug("Received audit event: type={}, service={}", request.getEventType(), request.getServiceName());
        return ResponseEntity.ok(auditService.createAuditEvent(request));
    }
    
    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all audit events", description = "Retrieve paginated list of all audit events (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getAllAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getAllAuditEvents(page, size));
    }
    
    @GetMapping("/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit event by ID", description = "Retrieve a specific audit event (Admin only)")
    public ResponseEntity<AuditEventResponse> getAuditEvent(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditEvent(id));
    }
    
    @GetMapping("/events/correlation/{correlationId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get events by correlation ID", description = "Retrieve all events for a specific correlation ID (Admin only)")
    public ResponseEntity<List<AuditEventResponse>> getByCorrelationId(@PathVariable String correlationId) {
        return ResponseEntity.ok(auditService.getByCorrelationId(correlationId));
    }
    
    @GetMapping("/events/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get events by user ID", description = "Retrieve all events for a specific user (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getByUserId(userId, page, size));
    }
    
    @GetMapping("/events/service/{serviceName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get events by service name", description = "Retrieve all events for a specific service (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getByServiceName(
            @PathVariable String serviceName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getByServiceName(serviceName, page, size));
    }
    
    @GetMapping("/events/type/{eventType}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get events by type", description = "Retrieve all events of a specific type (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getByEventType(
            @PathVariable String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getByEventType(eventType, page, size));
    }
    
    @GetMapping("/events/entity/{entityType}/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get events by entity", description = "Retrieve all events for a specific entity (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getByEntity(entityType, entityId, page, size));
    }
    
    @PostMapping("/events/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search audit events", description = "Search events with multiple criteria (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> searchAuditEvents(@RequestBody AuditSearchCriteria criteria) {
        return ResponseEntity.ok(auditService.searchAuditEvents(criteria));
    }
    
    @GetMapping("/events/errors")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get error events", description = "Retrieve events with error status codes (Admin only)")
    public ResponseEntity<Page<AuditEventResponse>> getErrors(
            @RequestParam(defaultValue = "24") int hours,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditService.getErrors(hours, page, size));
    }
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit dashboard", description = "Retrieve aggregated audit statistics (Admin only)")
    public ResponseEntity<AuditDashboardResponse> getDashboard(
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(auditService.getDashboard(hours));
    }
}
