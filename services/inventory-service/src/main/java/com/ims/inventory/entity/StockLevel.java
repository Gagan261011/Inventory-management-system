package com.ims.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_levels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"warehouse_id", "item_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevel {
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

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "reserved_quantity")
    @Builder.Default
    private Integer reservedQuantity = 0;

    @Column(name = "min_stock_level")
    @Builder.Default
    private Integer minStockLevel = 10;

    @Column(name = "max_stock_level")
    @Builder.Default
    private Integer maxStockLevel = 1000;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public Integer getAvailableQuantity() {
        return quantity - (reservedQuantity != null ? reservedQuantity : 0);
    }
}
