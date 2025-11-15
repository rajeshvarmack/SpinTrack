import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserEditComponent } from './features/users/user-edit/user-edit.component';
import { UnsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { UserViewComponent } from './features/users/user-view/user-view.component';
import { RoleListComponent } from './features/roles/role-list/role-list.component';
import { PermissionListComponent } from './features/permissions/permission-list/permission-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: UserEditComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'users/:id/edit', component: UserEditComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'users/:id', component: UserViewComponent },
      { path: 'roles', component: RoleListComponent },
      { path: 'permissions', component: PermissionListComponent }
    ]
  }
];
