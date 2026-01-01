import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { UserLayoutComponent } from './components/layout/user-layout.component';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { StockLevelsComponent } from './components/stock-levels/stock-levels.component';
import { StockMovementsComponent } from './components/stock-movements/stock-movements.component';
import { ReplenishmentRequestsComponent } from './components/replenishment-requests/replenishment-requests.component';
import { CreateMovementDialogComponent } from './components/create-movement-dialog/create-movement-dialog.component';
import { CreateReplenishmentDialogComponent } from './components/create-replenishment-dialog/create-replenishment-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'stock', component: StockLevelsComponent },
      { path: 'movements', component: StockMovementsComponent },
      { path: 'replenishments', component: ReplenishmentRequestsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    UserLayoutComponent,
    UserDashboardComponent,
    StockLevelsComponent,
    StockMovementsComponent,
    ReplenishmentRequestsComponent,
    CreateMovementDialogComponent,
    CreateReplenishmentDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
