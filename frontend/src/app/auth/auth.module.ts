import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './components/login/login.component';
import { LoginUserComponent } from './components/login-user/login-user.component';
import { LoginAdminComponent } from './components/login-admin/login-admin.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login/user', component: LoginUserComponent },
  { path: 'login/admin', component: LoginAdminComponent }
];

@NgModule({
  declarations: [
    LoginComponent,
    LoginUserComponent,
    LoginAdminComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
