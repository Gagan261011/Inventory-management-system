import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../../core/services/catalog.service';
import { Category } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-category-management',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Category Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Add Category
        </button>
      </div>
      
      <div class="card-grid">
        <!-- Create/Edit Form Card -->
        <mat-card *ngIf="showForm">
          <mat-card-header>
            <mat-card-title>{{ editingCategory ? 'Edit Category' : 'New Category' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput [(ngModel)]="formData.name" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="formData.description" rows="3"></textarea>
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="cancelForm()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!formData.name" (click)="saveCategory()">
              {{ editingCategory ? 'Update' : 'Create' }}
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Category Cards -->
        <mat-card *ngFor="let category of categories">
          <mat-card-header>
            <mat-card-title>{{ category.name }}</mat-card-title>
            <mat-card-subtitle>{{ category.itemCount }} items</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ category.description || 'No description' }}</p>
            <p class="created-date">Created: {{ category.createdAt | date:'mediumDate' }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editCategory(category)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteCategory(category)" 
                    [disabled]="category.itemCount > 0" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .created-date {
      color: #666;
      font-size: 12px;
      margin-top: 8px;
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  showForm = false;
  editingCategory: Category | null = null;
  formData = { name: '', description: '' };
  
  constructor(
    private catalogService: CatalogService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.loading = true;
    this.catalogService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  openCreateForm(): void {
    this.editingCategory = null;
    this.formData = { name: '', description: '' };
    this.showForm = true;
  }
  
  editCategory(category: Category): void {
    this.editingCategory = category;
    this.formData = { name: category.name, description: category.description };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.formData = { name: '', description: '' };
  }
  
  saveCategory(): void {
    if (!this.formData.name) return;
    
    if (this.editingCategory) {
      this.catalogService.updateCategory(this.editingCategory.id, this.formData).subscribe({
        next: () => {
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadCategories();
        }
      });
    } else {
      this.catalogService.createCategory(this.formData).subscribe({
        next: () => {
          this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadCategories();
        }
      });
    }
  }
  
  deleteCategory(category: Category): void {
    if (category.itemCount > 0) {
      this.snackBar.open('Cannot delete category with items', 'Close', { duration: 3000 });
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.catalogService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          this.loadCategories();
        }
      });
    }
  }
}
