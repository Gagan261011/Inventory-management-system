package com.ims.audit.service;

import com.ims.audit.dto.*;
import com.ims.audit.entity.AuditEvent;
import com.ims.audit.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    private final AuditEventRepository auditEventRepository;
    
    @Transactional
    public AuditEventResponse createAuditEvent(CreateAuditEventRequest request) {
        log.debug("Creating audit event: type={}, service={}, action={}", 
                request.getEventType(), request.getServiceName(), request.getAction());
        
        AuditEvent event = AuditEvent.builder()
                .eventType(request.getEventType())
                .serviceName(request.getServiceName())
                .correlationId(request.getCorrelationId())
                .traceId(request.getTraceId())
                .userId(request.getUserId())
                .username(request.getUsername())
                .userRole(request.getUserRole())
                .httpMethod(request.getHttpMethod())
                .requestPath(request.getRequestPath())
                .clientIp(request.getClientIp())
                .userAgent(request.getUserAgent())
                .requestBody(request.getRequestBody())
                .responseBody(request.getResponseBody())
                .responseStatus(request.getResponseStatus())
                .durationMs(request.getDurationMs())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .action(request.getAction())
                .previousValue(request.getPreviousValue())
                .newValue(request.getNewValue())
                .errorMessage(request.getErrorMessage())
                .stackTrace(request.getStackTrace())
                .metadata(request.getMetadata())
                .timestamp(LocalDateTime.now())
                .build();
        
        AuditEvent saved = auditEventRepository.save(event);
        log.info("Audit event created: id={}, type={}, service={}", saved.getId(), saved.getEventType(), saved.getServiceName());
        
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public AuditEventResponse getAuditEvent(Long id) {
        return auditEventRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Audit event not found: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<AuditEventResponse> getByCorrelationId(String correlationId) {
        return auditEventRepository.findByCorrelationId(correlationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getAllAuditEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditEventRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditEventRepository.findByUserId(userId, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByServiceName(String serviceName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditEventRepository.findByServiceName(serviceName, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByEventType(String eventType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditEventRepository.findByEventType(eventType, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getByEntity(String entityType, Long entityId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditEventRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> searchAuditEvents(AuditSearchCriteria criteria) {
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), Sort.by(Sort.Direction.DESC, "timestamp"));
        
        return auditEventRepository.searchAuditEvents(
                criteria.getServiceName(),
                criteria.getEventType(),
                criteria.getUserId(),
                criteria.getUsername(),
                criteria.getEntityType(),
                criteria.getEntityId(),
                criteria.getAction(),
                criteria.getStartDate(),
                criteria.getEndDate(),
                pageable
        ).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public Page<AuditEventResponse> getErrors(int hours, int page, int size) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        Pageable pageable = PageRequest.of(page, size);
        return auditEventRepository.findErrorsSince(since, pageable).map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public AuditDashboardResponse getDashboard(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        
        Long totalEvents = auditEventRepository.countByTimestampAfter(since);
        Long errorCount = auditEventRepository.countByResponseStatusGreaterThanEqualAndTimestampAfter(400, since);
        
        List<AuditDashboardResponse.EventTypeStat> eventTypeStats = auditEventRepository.countByEventTypeSince(since).stream()
                .map(row -> AuditDashboardResponse.EventTypeStat.builder()
                        .eventType((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
        
        List<AuditDashboardResponse.ServiceStat> serviceStats = auditEventRepository.countByServiceSince(since).stream()
                .map(row -> AuditDashboardResponse.ServiceStat.builder()
                        .serviceName((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
        
        List<AuditDashboardResponse.UserActivityStat> userActivityStats = auditEventRepository.countByUserSince(since).stream()
                .map(row -> AuditDashboardResponse.UserActivityStat.builder()
                        .username((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
        
        List<AuditDashboardResponse.ActionStat> actionStats = auditEventRepository.countByActionSince(since).stream()
                .map(row -> AuditDashboardResponse.ActionStat.builder()
                        .action((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
        
        List<AuditDashboardResponse.DailyActivityStat> dailyActivityStats = auditEventRepository.countByDateSince(since).stream()
                .map(row -> AuditDashboardResponse.DailyActivityStat.builder()
                        .date(row[0].toString())
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());
        
        return AuditDashboardResponse.builder()
                .totalEvents(totalEvents)
                .errorCount(errorCount)
                .eventTypeStats(eventTypeStats)
                .serviceStats(serviceStats)
                .userActivityStats(userActivityStats)
                .actionStats(actionStats)
                .dailyActivityStats(dailyActivityStats)
                .build();
    }
    
    private AuditEventResponse mapToResponse(AuditEvent event) {
        return AuditEventResponse.builder()
                .id(event.getId())
                .eventType(event.getEventType())
                .serviceName(event.getServiceName())
                .correlationId(event.getCorrelationId())
                .traceId(event.getTraceId())
                .userId(event.getUserId())
                .username(event.getUsername())
                .userRole(event.getUserRole())
                .httpMethod(event.getHttpMethod())
                .requestPath(event.getRequestPath())
                .clientIp(event.getClientIp())
                .userAgent(event.getUserAgent())
                .requestBody(event.getRequestBody())
                .responseBody(event.getResponseBody())
                .responseStatus(event.getResponseStatus())
                .durationMs(event.getDurationMs())
                .entityType(event.getEntityType())
                .entityId(event.getEntityId())
                .action(event.getAction())
                .previousValue(event.getPreviousValue())
                .newValue(event.getNewValue())
                .errorMessage(event.getErrorMessage())
                .stackTrace(event.getStackTrace())
                .metadata(event.getMetadata())
                .timestamp(event.getTimestamp())
                .build();
    }
}
