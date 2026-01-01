package com.ims.audit.config;

import com.ims.audit.entity.AuditEvent;
import com.ims.audit.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final AuditEventRepository auditEventRepository;
    private final Random random = new Random();
    
    @Override
    public void run(String... args) {
        if (auditEventRepository.count() == 0) {
            log.info("Initializing sample audit data...");
            initializeSampleData();
            log.info("Sample audit data initialized successfully");
        }
    }
    
    private void initializeSampleData() {
        List<String> services = Arrays.asList("auth-service", "catalog-service", "inventory-service");
        List<String> eventTypes = Arrays.asList("HTTP_REQUEST", "DATA_CHANGE", "AUTHENTICATION", "AUTHORIZATION", "ERROR");
        List<String> actions = Arrays.asList("CREATE", "UPDATE", "DELETE", "READ", "LOGIN", "LOGOUT", "APPROVE", "REJECT");
        List<String> entityTypes = Arrays.asList("User", "Item", "Category", "Supplier", "StockLevel", "StockMovement", "ReplenishmentRequest");
        List<String> users = Arrays.asList("admin@demo.com", "user1@demo.com", "user2@demo.com");
        List<String> roles = Arrays.asList("ROLE_ADMIN", "ROLE_USER", "ROLE_USER");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Create authentication events
        for (int i = 0; i < 10; i++) {
            int userIndex = random.nextInt(3);
            createAuditEvent(AuditEvent.builder()
                    .eventType("AUTHENTICATION")
                    .serviceName("auth-service")
                    .correlationId(UUID.randomUUID().toString())
                    .traceId(UUID.randomUUID().toString())
                    .userId((long) (userIndex + 1))
                    .username(users.get(userIndex))
                    .userRole(roles.get(userIndex))
                    .httpMethod("POST")
                    .requestPath("/api/auth/login")
                    .clientIp("192.168.1." + (100 + random.nextInt(50)))
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .responseStatus(200)
                    .durationMs((long) (50 + random.nextInt(200)))
                    .action("LOGIN")
                    .timestamp(now.minusHours(random.nextInt(48)))
                    .build());
        }
        
        // Create catalog events
        for (int i = 0; i < 30; i++) {
            int userIndex = random.nextInt(3);
            String action = actions.get(random.nextInt(4));
            String entityType = entityTypes.get(1 + random.nextInt(3)); // Item, Category, Supplier
            
            createAuditEvent(AuditEvent.builder()
                    .eventType("DATA_CHANGE")
                    .serviceName("catalog-service")
                    .correlationId(UUID.randomUUID().toString())
                    .traceId(UUID.randomUUID().toString())
                    .userId((long) (userIndex + 1))
                    .username(users.get(userIndex))
                    .userRole(roles.get(userIndex))
                    .httpMethod(getHttpMethod(action))
                    .requestPath("/api/" + entityType.toLowerCase() + "s/" + (1 + random.nextInt(20)))
                    .clientIp("192.168.1." + (100 + random.nextInt(50)))
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .responseStatus(getStatusForAction(action))
                    .durationMs((long) (20 + random.nextInt(150)))
                    .entityType(entityType)
                    .entityId((long) (1 + random.nextInt(20)))
                    .action(action)
                    .timestamp(now.minusHours(random.nextInt(48)))
                    .build());
        }
        
        // Create inventory events
        for (int i = 0; i < 40; i++) {
            int userIndex = random.nextInt(3);
            String action = actions.get(random.nextInt(8));
            String entityType = entityTypes.get(4 + random.nextInt(3)); // StockLevel, StockMovement, ReplenishmentRequest
            
            createAuditEvent(AuditEvent.builder()
                    .eventType(action.equals("APPROVE") || action.equals("REJECT") ? "AUTHORIZATION" : "DATA_CHANGE")
                    .serviceName("inventory-service")
                    .correlationId(UUID.randomUUID().toString())
                    .traceId(UUID.randomUUID().toString())
                    .userId((long) (userIndex + 1))
                    .username(users.get(userIndex))
                    .userRole(roles.get(userIndex))
                    .httpMethod(getHttpMethod(action))
                    .requestPath("/api/" + entityType.toLowerCase() + "s/" + (1 + random.nextInt(20)))
                    .clientIp("192.168.1." + (100 + random.nextInt(50)))
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .responseStatus(getStatusForAction(action))
                    .durationMs((long) (30 + random.nextInt(180)))
                    .entityType(entityType)
                    .entityId((long) (1 + random.nextInt(50)))
                    .action(action)
                    .metadata("{\"warehouseId\": " + (1 + random.nextInt(3)) + "}")
                    .timestamp(now.minusHours(random.nextInt(48)))
                    .build());
        }
        
        // Create some error events
        for (int i = 0; i < 5; i++) {
            int userIndex = random.nextInt(3);
            String service = services.get(random.nextInt(3));
            
            createAuditEvent(AuditEvent.builder()
                    .eventType("ERROR")
                    .serviceName(service)
                    .correlationId(UUID.randomUUID().toString())
                    .traceId(UUID.randomUUID().toString())
                    .userId((long) (userIndex + 1))
                    .username(users.get(userIndex))
                    .userRole(roles.get(userIndex))
                    .httpMethod("GET")
                    .requestPath("/api/items/999")
                    .clientIp("192.168.1." + (100 + random.nextInt(50)))
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .responseStatus(random.nextBoolean() ? 404 : 500)
                    .durationMs((long) (50 + random.nextInt(100)))
                    .errorMessage(random.nextBoolean() ? "Resource not found" : "Internal server error")
                    .timestamp(now.minusHours(random.nextInt(48)))
                    .build());
        }
        
        // Create HTTP request events
        for (int i = 0; i < 50; i++) {
            int userIndex = random.nextInt(3);
            String service = services.get(random.nextInt(3));
            
            createAuditEvent(AuditEvent.builder()
                    .eventType("HTTP_REQUEST")
                    .serviceName(service)
                    .correlationId(UUID.randomUUID().toString())
                    .traceId(UUID.randomUUID().toString())
                    .userId((long) (userIndex + 1))
                    .username(users.get(userIndex))
                    .userRole(roles.get(userIndex))
                    .httpMethod(Arrays.asList("GET", "POST", "PUT", "DELETE").get(random.nextInt(4)))
                    .requestPath("/api/" + Arrays.asList("items", "categories", "suppliers", "stock", "movements").get(random.nextInt(5)))
                    .clientIp("192.168.1." + (100 + random.nextInt(50)))
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .responseStatus(200)
                    .durationMs((long) (10 + random.nextInt(300)))
                    .timestamp(now.minusHours(random.nextInt(48)))
                    .build());
        }
    }
    
    private void createAuditEvent(AuditEvent event) {
        auditEventRepository.save(event);
    }
    
    private String getHttpMethod(String action) {
        return switch (action) {
            case "CREATE" -> "POST";
            case "UPDATE", "APPROVE", "REJECT" -> "PUT";
            case "DELETE" -> "DELETE";
            default -> "GET";
        };
    }
    
    private int getStatusForAction(String action) {
        return switch (action) {
            case "CREATE" -> 201;
            case "DELETE" -> 204;
            default -> 200;
        };
    }
}
