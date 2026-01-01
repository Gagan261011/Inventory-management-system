package com.ims.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "replenishment_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplenishmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_sku")
    private String itemSku;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "current_quantity")
    private Integer currentQuantity;

    @Column(name = "requested_quantity", nullable = false)
    private Integer requestedQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "requested_by")
    private Long requestedBy;

    @Column(name = "requested_by_email")
    private String requestedByEmail;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_by_email")
    private String approvedByEmail;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String notes;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }
}
