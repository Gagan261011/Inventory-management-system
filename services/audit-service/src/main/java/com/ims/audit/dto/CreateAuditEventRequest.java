package com.ims.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAuditEventRequest {
    
    private String eventType;
    private String serviceName;
    private String correlationId;
    private String traceId;
    private Long userId;
    private String username;
    private String userRole;
    private String httpMethod;
    private String requestPath;
    private String clientIp;
    private String userAgent;
    private String requestBody;
    private String responseBody;
    private Integer responseStatus;
    private Long durationMs;
    private String entityType;
    private Long entityId;
    private String action;
    private String previousValue;
    private String newValue;
    private String errorMessage;
    private String stackTrace;
    private String metadata;
}
