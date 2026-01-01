package com.ims.inventory.config;

import com.ims.inventory.entity.*;
import com.ims.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final WarehouseRepository warehouseRepository;
    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository movementRepository;
    private final ReplenishmentRequestRepository replenishmentRepository;

    private final Random random = new Random();

    @Override
    public void run(String... args) {
        // Create Warehouses
        Warehouse wh1 = createWarehouse("Main Warehouse", "WH-001", "123 Industrial Ave", "New York", "USA", "Bob Manager", "+1-555-1001");
        Warehouse wh2 = createWarehouse("East Distribution Center", "WH-002", "456 Logistics Blvd", "Boston", "USA", "Alice Supervisor", "+1-555-1002");
        Warehouse wh3 = createWarehouse("West Fulfillment Hub", "WH-003", "789 Commerce St", "Los Angeles", "USA", "Charlie Lead", "+1-555-1003");

        // Create Stock Levels (simulating items from catalog service)
        List<ItemInfo> items = Arrays.asList(
            new ItemInfo(1L, "SKU-LAPTOP-001", "Dell Laptop XPS 15", new BigDecimal("1299.99"), 5, 50),
            new ItemInfo(2L, "SKU-MONITOR-001", "Samsung 27\" Monitor", new BigDecimal("449.99"), 10, 100),
            new ItemInfo(3L, "SKU-KEYBOARD-001", "Logitech Wireless Keyboard", new BigDecimal("79.99"), 20, 200),
            new ItemInfo(4L, "SKU-MOUSE-001", "Logitech MX Master 3", new BigDecimal("99.99"), 20, 200),
            new ItemInfo(5L, "SKU-DESK-001", "Standing Desk Pro", new BigDecimal("599.99"), 5, 30),
            new ItemInfo(6L, "SKU-CHAIR-001", "Ergonomic Office Chair", new BigDecimal("399.99"), 10, 50),
            new ItemInfo(7L, "SKU-SHELF-001", "Industrial Shelving Unit", new BigDecimal("249.99"), 5, 40),
            new ItemInfo(8L, "SKU-BOX-SM-001", "Cardboard Box Small", new BigDecimal("1.99"), 500, 5000),
            new ItemInfo(9L, "SKU-BOX-MD-001", "Cardboard Box Medium", new BigDecimal("2.99"), 300, 3000),
            new ItemInfo(10L, "SKU-BOX-LG-001", "Cardboard Box Large", new BigDecimal("4.99"), 200, 2000),
            new ItemInfo(11L, "SKU-TAPE-001", "Packing Tape Roll", new BigDecimal("5.99"), 100, 1000),
            new ItemInfo(12L, "SKU-BUBBLE-001", "Bubble Wrap Roll", new BigDecimal("24.99"), 30, 200),
            new ItemInfo(13L, "SKU-DRILL-001", "Cordless Drill Kit", new BigDecimal("149.99"), 10, 50),
            new ItemInfo(14L, "SKU-TOOL-001", "Tool Set 150pc", new BigDecimal("199.99"), 5, 30),
            new ItemInfo(15L, "SKU-HELMET-001", "Safety Helmet", new BigDecimal("29.99"), 30, 200),
            new ItemInfo(16L, "SKU-VEST-001", "High-Vis Safety Vest", new BigDecimal("19.99"), 50, 300),
            new ItemInfo(17L, "SKU-GLOVES-001", "Work Gloves", new BigDecimal("14.99"), 100, 500),
            new ItemInfo(18L, "SKU-GLASSES-001", "Safety Glasses", new BigDecimal("9.99"), 100, 500),
            new ItemInfo(19L, "SKU-EARPLUG-001", "Ear Plugs Box", new BigDecimal("34.99"), 20, 100),
            new ItemInfo(20L, "SKU-FIRSTAID-001", "First Aid Kit", new BigDecimal("49.99"), 10, 50)
        );

        // Create stock levels for each warehouse
        for (Warehouse wh : Arrays.asList(wh1, wh2, wh3)) {
            for (ItemInfo item : items) {
                createStockLevel(wh, item);
            }
        }

        // Create some sample stock movements
        createSampleMovements(wh1, items);

        // Create some pending replenishment requests
        createSampleReplenishments(wh1, items);

        log.info("Sample data initialized: {} warehouses, {} stock levels, {} movements", 
                warehouseRepository.count(), stockLevelRepository.count(), movementRepository.count());
    }

    private Warehouse createWarehouse(String name, String code, String address, String city, String country, 
                                      String contactPerson, String phone) {
        return warehouseRepository.findByCode(code)
                .orElseGet(() -> warehouseRepository.save(Warehouse.builder()
                        .name(name)
                        .code(code)
                        .address(address)
                        .city(city)
                        .country(country)
                        .contactPerson(contactPerson)
                        .contactPhone(phone)
                        .active(true)
                        .build()));
    }

    private void createStockLevel(Warehouse warehouse, ItemInfo item) {
        StockLevel existing = stockLevelRepository.findByWarehouseIdAndItemId(warehouse.getId(), item.id).orElse(null);
        if (existing == null) {
            // Random quantity - some items will be low stock
            int quantity = random.nextInt(item.maxStock);
            // Make some items low stock
            if (random.nextDouble() < 0.2) {
                quantity = random.nextInt(item.minStock);
            }

            stockLevelRepository.save(StockLevel.builder()
                    .warehouseId(warehouse.getId())
                    .itemId(item.id)
                    .itemSku(item.sku)
                    .itemName(item.name)
                    .quantity(quantity)
                    .minStockLevel(item.minStock)
                    .maxStockLevel(item.maxStock)
                    .reservedQuantity(0)
                    .build());
        }
    }

    private void createSampleMovements(Warehouse warehouse, List<ItemInfo> items) {
        for (int i = 0; i < 20; i++) {
            ItemInfo item = items.get(random.nextInt(items.size()));
            StockMovement.MovementType type = random.nextBoolean() 
                    ? StockMovement.MovementType.GOODS_RECEIPT 
                    : StockMovement.MovementType.STOCK_ISSUE;
            
            movementRepository.save(StockMovement.builder()
                    .warehouseId(warehouse.getId())
                    .itemId(item.id)
                    .itemSku(item.sku)
                    .movementType(type)
                    .quantity(10 + random.nextInt(50))
                    .unitPrice(item.price)
                    .referenceNumber("REF-" + (1000 + i))
                    .referenceType(type == StockMovement.MovementType.GOODS_RECEIPT ? "PO" : "SALE")
                    .reason("Sample movement " + i)
                    .createdBy(random.nextBoolean() ? 2L : 3L)
                    .createdByEmail(random.nextBoolean() ? "user1@demo.com" : "user2@demo.com")
                    .build());
        }
    }

    private void createSampleReplenishments(Warehouse warehouse, List<ItemInfo> items) {
        for (int i = 0; i < 5; i++) {
            ItemInfo item = items.get(random.nextInt(items.size()));
            
            replenishmentRepository.save(ReplenishmentRequest.builder()
                    .warehouseId(warehouse.getId())
                    .itemId(item.id)
                    .itemSku(item.sku)
                    .itemName(item.name)
                    .currentQuantity(random.nextInt(item.minStock))
                    .requestedQuantity(item.minStock * 2)
                    .status(ReplenishmentRequest.RequestStatus.PENDING)
                    .priority(ReplenishmentRequest.Priority.values()[random.nextInt(4)])
                    .requestedBy(2L)
                    .requestedByEmail("user1@demo.com")
                    .notes("Low stock - needs replenishment")
                    .build());
        }
    }

    private record ItemInfo(Long id, String sku, String name, BigDecimal price, int minStock, int maxStock) {}
}
