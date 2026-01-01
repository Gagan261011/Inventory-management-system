import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AuditService } from '../../../core/services/audit.service';
import { AuditEvent } from '../../../core/models/audit.model';

@Component({
  selector: 'app-audit-logs',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Audit Logs</h1>
      </div>
      
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Service</mat-label>
              <mat-select [(value)]="filters.serviceName" (selectionChange)="onFilterChange()">
                <mat-option value="">All</mat-option>
                <mat-option value="auth-service">Auth Service</mat-option>
                <mat-option value="catalog-service">Catalog Service</mat-option>
                <mat-option value="inventory-service">Inventory Service</mat-option>
                <mat-option value="audit-service">Audit Service</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Event Type</mat-label>
              <mat-select [(value)]="filters.eventType" (selectionChange)="onFilterChange()">
                <mat-option value="">All</mat-option>
                <mat-option value="LOGIN_SUCCESS">Login Success</mat-option>
                <mat-option value="LOGIN_FAILURE">Login Failure</mat-option>
                <mat-option value="LOGOUT">Logout</mat-option>
                <mat-option value="CREATE">Create</mat-option>
                <mat-option value="UPDATE">Update</mat-option>
                <mat-option value="DELETE">Delete</mat-option>
                <mat-option value="STOCK_MOVEMENT">Stock Movement</mat-option>
                <mat-option value="REPLENISHMENT_REQUEST">Replenishment Request</mat-option>
                <mat-option value="APPROVAL">Approval</mat-option>
                <mat-option value="REJECTION">Rejection</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>User</mat-label>
              <input matInput [(ngModel)]="filters.username" placeholder="Filter by username">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Correlation ID</mat-label>
              <input matInput [(ngModel)]="filters.correlationId" placeholder="Filter by correlation ID">
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="onFilterChange()">
              <mat-icon>search</mat-icon> Search
            </button>
            
            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon> Clear
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="events">
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                <td mat-cell *matCellDef="let item">{{ item.timestamp | date:'medium' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="serviceName">
                <th mat-header-cell *matHeaderCellDef>Service</th>
                <td mat-cell *matCellDef="let item">
                  <span class="service-badge" [attr.data-service]="item.serviceName">
                    {{ item.serviceName }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="eventType">
                <th mat-header-cell *matHeaderCellDef>Event Type</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="'event-type ' + getEventClass(item.eventType)">
                    {{ item.eventType }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let item">{{ item.action }}</td>
              </ng-container>
              
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let item">{{ item.username || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="entityType">
                <th mat-header-cell *matHeaderCellDef>Entity Type</th>
                <td mat-cell *matCellDef="let item">{{ item.entityType || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="entityId">
                <th mat-header-cell *matHeaderCellDef>Entity ID</th>
                <td mat-cell *matCellDef="let item">{{ item.entityId || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="correlationId">
                <th mat-header-cell *matHeaderCellDef>Correlation ID</th>
                <td mat-cell *matCellDef="let item">
                  <span class="correlation-id" [matTooltip]="item.correlationId">
                    {{ item.correlationId?.substring(0, 8) }}...
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="ipAddress">
                <th mat-header-cell *matHeaderCellDef>IP Address</th>
                <td mat-cell *matCellDef="let item">{{ item.ipAddress || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="success">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <mat-icon [class]="item.success ? 'success-icon' : 'error-icon'">
                    {{ item.success ? 'check_circle' : 'error' }}
                  </mat-icon>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="showDetails(row)"></tr>
            </table>
            
            <mat-paginator 
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageSizeOptions]="[20, 50, 100]"
              (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Details Panel -->
      <mat-card *ngIf="selectedEvent" class="details-card">
        <mat-card-header>
          <mat-card-title>Event Details</mat-card-title>
          <button mat-icon-button (click)="selectedEvent = null" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID</label>
              <span>{{ selectedEvent.id }}</span>
            </div>
            <div class="detail-item">
              <label>Timestamp</label>
              <span>{{ selectedEvent.timestamp | date:'full' }}</span>
            </div>
            <div class="detail-item">
              <label>Service</label>
              <span>{{ selectedEvent.serviceName }}</span>
            </div>
            <div class="detail-item">
              <label>Event Type</label>
              <span>{{ selectedEvent.eventType }}</span>
            </div>
            <div class="detail-item">
              <label>Action</label>
              <span>{{ selectedEvent.action }}</span>
            </div>
            <div class="detail-item">
              <label>Username</label>
              <span>{{ selectedEvent.username || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Entity Type</label>
              <span>{{ selectedEvent.entityType || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Entity ID</label>
              <span>{{ selectedEvent.entityId || '-' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Correlation ID</label>
              <span class="mono">{{ selectedEvent.correlationId }}</span>
            </div>
            <div class="detail-item">
              <label>IP Address</label>
              <span>{{ selectedEvent.ipAddress || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>User Agent</label>
              <span>{{ selectedEvent.userAgent || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Success</label>
              <span [class]="selectedEvent.success ? 'success' : 'error'">
                {{ selectedEvent.success ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="detail-item full-width" *ngIf="selectedEvent.details">
              <label>Details</label>
              <pre>{{ selectedEvent.details }}</pre>
            </div>
            <div class="detail-item full-width" *ngIf="selectedEvent.errorMessage">
              <label>Error Message</label>
              <span class="error">{{ selectedEvent.errorMessage }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 16px;
    }
    
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    
    .filter-row mat-form-field {
      width: 180px;
    }
    
    .service-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      background-color: #e0e0e0;
    }
    
    .service-badge[data-service="auth-service"] {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .service-badge[data-service="catalog-service"] {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }
    
    .service-badge[data-service="inventory-service"] {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .service-badge[data-service="audit-service"] {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .event-type {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .event-type.success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .event-type.warning {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .event-type.error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .event-type.info {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .correlation-id {
      font-family: monospace;
      font-size: 12px;
      cursor: pointer;
    }
    
    .success-icon {
      color: #4caf50;
    }
    
    .error-icon {
      color: #f44336;
    }
    
    table {
      width: 100%;
    }
    
    tr.mat-mdc-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    
    .details-card {
      margin-top: 16px;
    }
    
    .details-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .close-btn {
      position: absolute;
      right: 8px;
      top: 8px;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .detail-item label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    
    .detail-item span {
      font-size: 14px;
    }
    
    .detail-item.full-width {
      grid-column: span 3;
    }
    
    .detail-item pre {
      background-color: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
    
    .mono {
      font-family: monospace;
    }
    
    .success {
      color: #4caf50;
    }
    
    .error {
      color: #f44336;
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  events: AuditEvent[] = [];
  loading = true;
  selectedEvent: AuditEvent | null = null;
  
  displayedColumns = ['timestamp', 'serviceName', 'eventType', 'action', 'username', 'entityType', 'entityId', 'correlationId', 'ipAddress', 'success'];
  
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  filters: {
    serviceName: string;
    eventType: string;
    username: string;
    correlationId: string;
  } = {
    serviceName: '',
    eventType: '',
    username: '',
    correlationId: ''
  };
  
  constructor(private auditService: AuditService) {}
  
  ngOnInit(): void {
    this.loadEvents();
  }
  
  loadEvents(): void {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      size: this.pageSize
    };
    
    if (this.filters.serviceName) params.serviceName = this.filters.serviceName;
    if (this.filters.eventType) params.eventType = this.filters.eventType;
    if (this.filters.username) params.username = this.filters.username;
    if (this.filters.correlationId) params.correlationId = this.filters.correlationId;
    
    this.auditService.searchEvents(params).subscribe({
      next: (page) => {
        this.events = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }
  
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadEvents();
  }
  
  clearFilters(): void {
    this.filters = {
      serviceName: '',
      eventType: '',
      username: '',
      correlationId: ''
    };
    this.currentPage = 0;
    this.loadEvents();
  }
  
  showDetails(event: AuditEvent): void {
    this.selectedEvent = event;
  }
  
  getEventClass(eventType: string): string {
    if (eventType.includes('SUCCESS') || eventType === 'APPROVAL') return 'success';
    if (eventType.includes('FAILURE') || eventType === 'REJECTION') return 'error';
    if (eventType.includes('DELETE')) return 'warning';
    return 'info';
  }
}
