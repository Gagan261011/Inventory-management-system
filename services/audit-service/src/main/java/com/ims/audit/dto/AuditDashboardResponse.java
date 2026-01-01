package com.ims.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditDashboardResponse {
    
    private Long totalEvents;
    private Long errorCount;
    private List<EventTypeStat> eventTypeStats;
    private List<ServiceStat> serviceStats;
    private List<UserActivityStat> userActivityStats;
    private List<ActionStat> actionStats;
    private List<DailyActivityStat> dailyActivityStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EventTypeStat {
        private String eventType;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceStat {
        private String serviceName;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserActivityStat {
        private String username;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActionStat {
        private String action;
        private Long count;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyActivityStat {
        private String date;
        private Long count;
    }
}
