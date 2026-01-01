package com.ims.inventory.repository;

import com.ims.inventory.entity.ReplenishmentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplenishmentRequestRepository extends JpaRepository<ReplenishmentRequest, Long> {
    List<ReplenishmentRequest> findByWarehouseId(Long warehouseId);
    
    List<ReplenishmentRequest> findByStatus(ReplenishmentRequest.RequestStatus status);
    
    Page<ReplenishmentRequest> findByStatus(ReplenishmentRequest.RequestStatus status, Pageable pageable);
    
    List<ReplenishmentRequest> findByRequestedBy(Long userId);
    
    Page<ReplenishmentRequest> findByRequestedBy(Long userId, Pageable pageable);
    
    List<ReplenishmentRequest> findByWarehouseIdAndStatus(Long warehouseId, ReplenishmentRequest.RequestStatus status);
    
    long countByStatus(ReplenishmentRequest.RequestStatus status);
}
