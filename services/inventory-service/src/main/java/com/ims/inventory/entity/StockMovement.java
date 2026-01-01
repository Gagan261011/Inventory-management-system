package com.ims.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_sku")
    private String itemSku;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_value", precision = 12, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "reference_type")
    private String referenceType; // PO, INVOICE, TRANSFER, ADJUSTMENT

    private String reason;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_by_email")
    private String createdByEmail;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (unitPrice != null && quantity != null) {
            totalValue = unitPrice.multiply(BigDecimal.valueOf(Math.abs(quantity)));
        }
    }

    public enum MovementType {
        GOODS_RECEIPT,  // Inbound
        STOCK_ISSUE,    // Outbound
        TRANSFER_IN,
        TRANSFER_OUT,
        ADJUSTMENT,
        RETURN,
        DAMAGE,
        WRITE_OFF
    }
}
