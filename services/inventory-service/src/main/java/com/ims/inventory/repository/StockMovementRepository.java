package com.ims.inventory.repository;

import com.ims.inventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByWarehouseId(Long warehouseId);
    
    Page<StockMovement> findByWarehouseId(Long warehouseId, Pageable pageable);
    
    List<StockMovement> findByItemId(Long itemId);
    
    List<StockMovement> findByCreatedBy(Long userId);
    
    Page<StockMovement> findByCreatedBy(Long userId, Pageable pageable);
    
    @Query("SELECT m FROM StockMovement m WHERE m.warehouseId = :warehouseId " +
           "AND m.createdAt BETWEEN :fromDate AND :toDate")
    List<StockMovement> findByWarehouseAndDateRange(
            @Param("warehouseId") Long warehouseId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
    
    @Query("SELECT m FROM StockMovement m WHERE " +
           "(:warehouseId IS NULL OR m.warehouseId = :warehouseId) AND " +
           "(:itemSku IS NULL OR m.itemSku = :itemSku) AND " +
           "(:fromDate IS NULL OR m.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR m.createdAt <= :toDate)")
    Page<StockMovement> searchMovements(
            @Param("warehouseId") Long warehouseId,
            @Param("itemSku") String itemSku,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

    @Query("SELECT m FROM StockMovement m ORDER BY m.createdAt DESC")
    List<StockMovement> findRecentMovements(Pageable pageable);
}
