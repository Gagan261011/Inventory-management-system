package com.ims.inventory.repository;

import com.ims.inventory.entity.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {
    List<StockLevel> findByWarehouseId(Long warehouseId);
    
    Optional<StockLevel> findByWarehouseIdAndItemId(Long warehouseId, Long itemId);
    
    @Query("SELECT s FROM StockLevel s WHERE s.quantity <= s.minStockLevel")
    List<StockLevel> findLowStockItems();
    
    @Query("SELECT s FROM StockLevel s WHERE s.warehouseId = :warehouseId AND s.quantity <= s.minStockLevel")
    List<StockLevel> findLowStockItemsByWarehouse(@Param("warehouseId") Long warehouseId);
    
    @Query("SELECT s FROM StockLevel s WHERE s.itemId = :itemId")
    List<StockLevel> findByItemId(@Param("itemId") Long itemId);
    
    @Query("SELECT SUM(s.quantity) FROM StockLevel s WHERE s.itemId = :itemId")
    Integer getTotalStockByItem(@Param("itemId") Long itemId);

    @Query("SELECT s FROM StockLevel s WHERE s.itemSku = :sku")
    List<StockLevel> findByItemSku(@Param("sku") String sku);
}
