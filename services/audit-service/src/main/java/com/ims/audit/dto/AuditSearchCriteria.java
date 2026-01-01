package com.ims.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditSearchCriteria {
    
    private String serviceName;
    private String eventType;
    private Long userId;
    private String username;
    private String entityType;
    private Long entityId;
    private String action;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int page = 0;
    private int size = 20;
}
