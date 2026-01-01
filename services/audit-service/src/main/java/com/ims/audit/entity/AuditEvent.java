package com.ims.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_events", indexes = {
    @Index(name = "idx_correlation_id", columnList = "correlationId"),
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_event_type", columnList = "eventType"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_service_name", columnList = "serviceName")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String eventType;
    
    @Column(nullable = false, length = 50)
    private String serviceName;
    
    @Column(length = 100)
    private String correlationId;
    
    @Column(length = 100)
    private String traceId;
    
    @Column
    private Long userId;
    
    @Column(length = 100)
    private String username;
    
    @Column(length = 50)
    private String userRole;
    
    @Column(length = 20)
    private String httpMethod;
    
    @Column(length = 500)
    private String requestPath;
    
    @Column(length = 100)
    private String clientIp;
    
    @Column(length = 500)
    private String userAgent;
    
    @Column(columnDefinition = "TEXT")
    private String requestBody;
    
    @Column(columnDefinition = "TEXT")
    private String responseBody;
    
    @Column
    private Integer responseStatus;
    
    @Column
    private Long durationMs;
    
    @Column(length = 50)
    private String entityType;
    
    @Column
    private Long entityId;
    
    @Column(length = 50)
    private String action;
    
    @Column(columnDefinition = "TEXT")
    private String previousValue;
    
    @Column(columnDefinition = "TEXT")
    private String newValue;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(columnDefinition = "TEXT")
    private String stackTrace;
    
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
