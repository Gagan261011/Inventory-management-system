import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { AdminLayoutComponent } from './components/layout/admin-layout.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ItemManagementComponent } from './components/item-management/item-management.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { SupplierManagementComponent } from './components/supplier-management/supplier-management.component';
import { WarehouseManagementComponent } from './components/warehouse-management/warehouse-management.component';
import { ReplenishmentApprovalComponent } from './components/replenishment-approval/replenishment-approval.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { ItemDialogComponent } from './components/item-dialog/item-dialog.component';
import { ApprovalDialogComponent } from './components/approval-dialog/approval-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'items', component: ItemManagementComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'suppliers', component: SupplierManagementComponent },
      { path: 'warehouses', component: WarehouseManagementComponent },
      { path: 'replenishments', component: ReplenishmentApprovalComponent },
      { path: 'audit', component: AuditLogsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    UserManagementComponent,
    ItemManagementComponent,
    CategoryManagementComponent,
    SupplierManagementComponent,
    WarehouseManagementComponent,
    ReplenishmentApprovalComponent,
    AuditLogsComponent,
    UserDialogComponent,
    ItemDialogComponent,
    ApprovalDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
