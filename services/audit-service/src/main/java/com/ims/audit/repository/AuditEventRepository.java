package com.ims.audit.repository;

import com.ims.audit.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    
    List<AuditEvent> findByCorrelationId(String correlationId);
    
    Page<AuditEvent> findByUserId(Long userId, Pageable pageable);
    
    Page<AuditEvent> findByUsername(String username, Pageable pageable);
    
    Page<AuditEvent> findByServiceName(String serviceName, Pageable pageable);
    
    Page<AuditEvent> findByEventType(String eventType, Pageable pageable);
    
    Page<AuditEvent> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);
    
    Page<AuditEvent> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    @Query("SELECT a FROM AuditEvent a WHERE " +
           "(:serviceName IS NULL OR a.serviceName = :serviceName) AND " +
           "(:eventType IS NULL OR a.eventType = :eventType) AND " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:username IS NULL OR a.username LIKE %:username%) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:entityId IS NULL OR a.entityId = :entityId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR a.timestamp <= :endDate)")
    Page<AuditEvent> searchAuditEvents(
        @Param("serviceName") String serviceName,
        @Param("eventType") String eventType,
        @Param("userId") Long userId,
        @Param("username") String username,
        @Param("entityType") String entityType,
        @Param("entityId") Long entityId,
        @Param("action") String action,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    @Query("SELECT a.eventType, COUNT(a) FROM AuditEvent a " +
           "WHERE a.timestamp >= :since GROUP BY a.eventType ORDER BY COUNT(a) DESC")
    List<Object[]> countByEventTypeSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a.serviceName, COUNT(a) FROM AuditEvent a " +
           "WHERE a.timestamp >= :since GROUP BY a.serviceName ORDER BY COUNT(a) DESC")
    List<Object[]> countByServiceSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a.username, COUNT(a) FROM AuditEvent a " +
           "WHERE a.timestamp >= :since AND a.username IS NOT NULL " +
           "GROUP BY a.username ORDER BY COUNT(a) DESC")
    List<Object[]> countByUserSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a.action, COUNT(a) FROM AuditEvent a " +
           "WHERE a.timestamp >= :since AND a.action IS NOT NULL " +
           "GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> countByActionSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT a FROM AuditEvent a WHERE a.responseStatus >= 400 AND a.timestamp >= :since ORDER BY a.timestamp DESC")
    Page<AuditEvent> findErrorsSince(@Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT DATE(a.timestamp), COUNT(a) FROM AuditEvent a " +
           "WHERE a.timestamp >= :since GROUP BY DATE(a.timestamp) ORDER BY DATE(a.timestamp)")
    List<Object[]> countByDateSince(@Param("since") LocalDateTime since);
    
    Long countByTimestampAfter(LocalDateTime since);
    
    Long countByResponseStatusGreaterThanEqualAndTimestampAfter(Integer status, LocalDateTime since);
}
