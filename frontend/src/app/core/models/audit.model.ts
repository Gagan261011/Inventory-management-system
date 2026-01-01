export interface AuditEvent {
  id: number;
  eventType: string;
  serviceName: string;
  correlationId: string;
  traceId: string;
  userId: number;
  username: string;
  userRole: string;
  httpMethod: string;
  requestPath: string;
  clientIp: string;
  ipAddress: string;
  userAgent: string;
  requestBody: string;
  responseBody: string;
  responseStatus: number;
  durationMs: number;
  entityType: string;
  entityId: number;
  action: string;
  previousValue: string;
  newValue: string;
  details: string;
  success: boolean;
  errorMessage: string;
  stackTrace: string;
  metadata: string;
  timestamp: string;
}

export interface AuditSearchCriteria {
  serviceName?: string;
  eventType?: string;
  userId?: number;
  username?: string;
  entityType?: string;
  entityId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface AuditDashboard {
  totalEvents: number;
  errorCount: number;
  eventTypeStats: { eventType: string; count: number }[];
  serviceStats: { serviceName: string; count: number }[];
  userActivityStats: { username: string; count: number }[];
  actionStats: { action: string; count: number }[];
  dailyActivityStats: { date: string; count: number }[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
