import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditEvent, AuditSearchCriteria, AuditDashboard, Page } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = environment.apiUrl.audit;

  constructor(private http: HttpClient) { }

  getAllAuditEvents(page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events?page=${page}&size=${size}`);
  }

  getAuditEvent(id: number): Observable<AuditEvent> {
    return this.http.get<AuditEvent>(`${this.apiUrl}/audit/events/${id}`);
  }

  getByCorrelationId(correlationId: string): Observable<AuditEvent[]> {
    return this.http.get<AuditEvent[]>(`${this.apiUrl}/audit/events/correlation/${correlationId}`);
  }

  getByUserId(userId: number, page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events/user/${userId}?page=${page}&size=${size}`);
  }

  getByServiceName(serviceName: string, page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events/service/${serviceName}?page=${page}&size=${size}`);
  }

  getByEventType(eventType: string, page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events/type/${eventType}?page=${page}&size=${size}`);
  }

  getByEntity(entityType: string, entityId: number, page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events/entity/${entityType}/${entityId}?page=${page}&size=${size}`);
  }

  searchAuditEvents(criteria: AuditSearchCriteria): Observable<Page<AuditEvent>> {
    return this.http.post<Page<AuditEvent>>(`${this.apiUrl}/audit/events/search`, criteria);
  }

  getErrors(hours = 24, page = 0, size = 20): Observable<Page<AuditEvent>> {
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events/errors?hours=${hours}&page=${page}&size=${size}`);
  }

  getDashboard(hours = 24): Observable<AuditDashboard> {
    return this.http.get<AuditDashboard>(`${this.apiUrl}/audit/dashboard?hours=${hours}`);
  }

  searchEvents(params: any): Observable<Page<AuditEvent>> {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        queryParams.append(key, params[key]);
      }
    });
    return this.http.get<Page<AuditEvent>>(`${this.apiUrl}/audit/events?${queryParams.toString()}`);
  }
}
