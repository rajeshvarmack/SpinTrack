import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserEditComponent } from './features/users/user-edit/user-edit.component';
import { UnsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { UserViewComponent } from './features/users/user-view/user-view.component';
import { RoleFormComponent } from './features/roles/role-form/role-form.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ModuleFormComponent } from './features/modules/module-form/module-form.component';
import { SubModuleFormComponent } from './features/submodules/submodule-form/submodule-form.component';
import { PermissionFormComponent } from './features/permissions/permission-form/permission-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'users/add', component: UserEditComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'users/:id/edit', component: UserEditComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'users/:id', component: UserViewComponent },
      { path: 'roles', component: RoleFormComponent },
      { path: 'modules', component: ModuleFormComponent },
      { path: 'submodules', component: SubModuleFormComponent },
      { path: 'permissions', component: PermissionFormComponent }
    ]
  }
];
