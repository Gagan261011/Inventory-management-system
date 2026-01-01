package com.ims.catalog.config;

import com.ims.catalog.entity.Category;
import com.ims.catalog.entity.Item;
import com.ims.catalog.entity.Supplier;
import com.ims.catalog.repository.CategoryRepository;
import com.ims.catalog.repository.ItemRepository;
import com.ims.catalog.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;

    @Override
    public void run(String... args) {
        // Create Categories
        Category electronics = createCategory("Electronics", "Electronic devices and components");
        Category furniture = createCategory("Furniture", "Office and warehouse furniture");
        Category packaging = createCategory("Packaging", "Packaging materials and supplies");
        Category tools = createCategory("Tools", "Hand tools and power tools");
        Category safety = createCategory("Safety", "Safety equipment and PPE");

        // Create Suppliers
        Supplier techSupply = createSupplier("TechSupply Inc", "John Smith", "john@techsupply.com", "+1-555-0101", "123 Tech Street, Silicon Valley, CA");
        Supplier globalParts = createSupplier("Global Parts Co", "Sarah Johnson", "sarah@globalparts.com", "+1-555-0102", "456 Industrial Blvd, Chicago, IL");
        Supplier packagingPro = createSupplier("PackagingPro", "Mike Wilson", "mike@packagingpro.com", "+1-555-0103", "789 Warehouse Ave, Dallas, TX");
        Supplier safetyFirst = createSupplier("SafetyFirst Ltd", "Emma Brown", "emma@safetyfirst.com", "+1-555-0104", "321 Safety Lane, Boston, MA");

        // Create Items
        List<Item> items = Arrays.asList(
            createItem("SKU-LAPTOP-001", "Dell Laptop XPS 15", "High-performance laptop for business use", electronics, techSupply, new BigDecimal("1299.99"), 5, 50, 10, "UNIT"),
            createItem("SKU-MONITOR-001", "Samsung 27\" Monitor", "4K UHD monitor with USB-C", electronics, techSupply, new BigDecimal("449.99"), 10, 100, 20, "UNIT"),
            createItem("SKU-KEYBOARD-001", "Logitech Wireless Keyboard", "Ergonomic wireless keyboard", electronics, techSupply, new BigDecimal("79.99"), 20, 200, 30, "UNIT"),
            createItem("SKU-MOUSE-001", "Logitech MX Master 3", "Wireless mouse with advanced features", electronics, techSupply, new BigDecimal("99.99"), 20, 200, 30, "UNIT"),
            createItem("SKU-DESK-001", "Standing Desk Pro", "Electric height-adjustable desk", furniture, globalParts, new BigDecimal("599.99"), 5, 30, 8, "UNIT"),
            createItem("SKU-CHAIR-001", "Ergonomic Office Chair", "Premium ergonomic chair with lumbar support", furniture, globalParts, new BigDecimal("399.99"), 10, 50, 15, "UNIT"),
            createItem("SKU-SHELF-001", "Industrial Shelving Unit", "Heavy-duty steel shelving", furniture, globalParts, new BigDecimal("249.99"), 5, 40, 10, "UNIT"),
            createItem("SKU-BOX-SM-001", "Cardboard Box Small", "Small shipping box 12x10x8", packaging, packagingPro, new BigDecimal("1.99"), 500, 5000, 1000, "UNIT"),
            createItem("SKU-BOX-MD-001", "Cardboard Box Medium", "Medium shipping box 18x14x12", packaging, packagingPro, new BigDecimal("2.99"), 300, 3000, 600, "UNIT"),
            createItem("SKU-BOX-LG-001", "Cardboard Box Large", "Large shipping box 24x18x18", packaging, packagingPro, new BigDecimal("4.99"), 200, 2000, 400, "UNIT"),
            createItem("SKU-TAPE-001", "Packing Tape Roll", "Heavy-duty packing tape 2\" wide", packaging, packagingPro, new BigDecimal("5.99"), 100, 1000, 200, "ROLL"),
            createItem("SKU-BUBBLE-001", "Bubble Wrap Roll", "Bubble wrap 12\" x 175'", packaging, packagingPro, new BigDecimal("24.99"), 30, 200, 50, "ROLL"),
            createItem("SKU-DRILL-001", "Cordless Drill Kit", "18V cordless drill with battery", tools, globalParts, new BigDecimal("149.99"), 10, 50, 15, "SET"),
            createItem("SKU-TOOL-001", "Tool Set 150pc", "Comprehensive mechanic tool set", tools, globalParts, new BigDecimal("199.99"), 5, 30, 10, "SET"),
            createItem("SKU-HELMET-001", "Safety Helmet", "OSHA-approved hard hat", safety, safetyFirst, new BigDecimal("29.99"), 30, 200, 50, "UNIT"),
            createItem("SKU-VEST-001", "High-Vis Safety Vest", "Reflective safety vest Class 3", safety, safetyFirst, new BigDecimal("19.99"), 50, 300, 75, "UNIT"),
            createItem("SKU-GLOVES-001", "Work Gloves", "Cut-resistant work gloves", safety, safetyFirst, new BigDecimal("14.99"), 100, 500, 150, "PAIR"),
            createItem("SKU-GLASSES-001", "Safety Glasses", "Anti-fog safety glasses", safety, safetyFirst, new BigDecimal("9.99"), 100, 500, 150, "UNIT"),
            createItem("SKU-EARPLUG-001", "Ear Plugs Box", "Disposable ear plugs - box of 200", safety, safetyFirst, new BigDecimal("34.99"), 20, 100, 30, "BOX"),
            createItem("SKU-FIRSTAID-001", "First Aid Kit", "OSHA-compliant first aid kit", safety, safetyFirst, new BigDecimal("49.99"), 10, 50, 15, "KIT")
        );

        log.info("Sample data initialized: {} categories, {} suppliers, {} items", 
                categoryRepository.count(), supplierRepository.count(), itemRepository.count());
    }

    private Category createCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name(name)
                        .description(description)
                        .build()));
    }

    private Supplier createSupplier(String name, String contactPerson, String email, String phone, String address) {
        return supplierRepository.findByName(name)
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .name(name)
                        .contactPerson(contactPerson)
                        .email(email)
                        .phone(phone)
                        .address(address)
                        .active(true)
                        .build()));
    }

    private Item createItem(String sku, String name, String description, Category category, 
                           Supplier supplier, BigDecimal price, int minStock, int maxStock, 
                           int reorderPoint, String unitOfMeasure) {
        return itemRepository.findBySku(sku)
                .orElseGet(() -> itemRepository.save(Item.builder()
                        .sku(sku)
                        .name(name)
                        .description(description)
                        .category(category)
                        .supplier(supplier)
                        .unitPrice(price)
                        .minStockLevel(minStock)
                        .maxStockLevel(maxStock)
                        .reorderPoint(reorderPoint)
                        .unitOfMeasure(unitOfMeasure)
                        .active(true)
                        .build()));
    }
}
