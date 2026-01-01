import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CatalogService } from '../../../core/services/catalog.service';
import { Item, Category, Supplier } from '../../../core/models/catalog.model';
import { ItemDialogComponent } from '../item-dialog/item-dialog.component';

@Component({
  selector: 'app-item-management',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Item Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Item
        </button>
      </div>
      
      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Search by name or SKU">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryChange()">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        
        <button mat-button (click)="clearFilters()">Clear Filters</button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="items">
              <ng-container matColumnDef="sku">
                <th mat-header-cell *matHeaderCellDef>SKU</th>
                <td mat-cell *matCellDef="let item">{{ item.sku }}</td>
              </ng-container>
              
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let item">{{ item.name }}</td>
              </ng-container>
              
              <ng-container matColumnDef="categoryName">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let item">{{ item.categoryName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="supplierName">
                <th mat-header-cell *matHeaderCellDef>Supplier</th>
                <td mat-cell *matCellDef="let item">{{ item.supplierName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="unitPrice">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency }}</td>
              </ng-container>
              
              <ng-container matColumnDef="reorderLevel">
                <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
                <td mat-cell *matCellDef="let item">{{ item.reorderLevel }}</td>
              </ng-container>
              
              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="'status-chip ' + (item.active ? 'approved' : 'rejected')">
                    {{ item.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="openEditDialog(item)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteItem(item)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <mat-paginator 
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
    }
    
    .filter-row mat-form-field {
      margin-right: 16px;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-chip.approved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.rejected {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class ItemManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  items: Item[] = [];
  categories: Category[] = [];
  loading = true;
  
  searchQuery = '';
  selectedCategory = '';
  
  displayedColumns = ['sku', 'name', 'categoryName', 'supplierName', 'unitPrice', 'reorderLevel', 'active', 'actions'];
  
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  constructor(
    private catalogService: CatalogService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }
  
  loadCategories(): void {
    this.catalogService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }
  
  loadItems(): void {
    this.loading = true;
    
    let request;
    if (this.searchQuery) {
      request = this.catalogService.searchItems(this.searchQuery, this.currentPage, this.pageSize);
    } else if (this.selectedCategory) {
      request = this.catalogService.getItemsByCategory(+this.selectedCategory, this.currentPage, this.pageSize);
    } else {
      request = this.catalogService.getAllItems(this.currentPage, this.pageSize);
    }
    
    request.subscribe({
      next: (page) => {
        this.items = page.content;
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
    this.loadItems();
  }
  
  search(): void {
    this.currentPage = 0;
    this.selectedCategory = '';
    this.loadItems();
  }
  
  onCategoryChange(): void {
    this.currentPage = 0;
    this.searchQuery = '';
    this.loadItems();
  }
  
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.currentPage = 0;
    this.loadItems();
  }
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }
  
  openEditDialog(item: Item): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '600px',
      data: { mode: 'edit', item }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }
  
  deleteItem(item: Item): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.catalogService.deleteItem(item.id).subscribe({
        next: () => this.loadItems()
      });
    }
  }
}
