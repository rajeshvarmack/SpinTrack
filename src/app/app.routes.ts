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
import { CountryFormComponent } from './features/countries/country-form/country-form.component';
import { CurrencyFormComponent } from './features/currencies/currency-form/currency-form.component';
import { TimeZoneFormComponent } from './features/timezones/timezone-form/timezone-form.component';
import { DateFormatFormComponent } from './features/date-formats/date-format-form/date-format-form.component';
import { CompanyListComponent } from './features/company/company-list/company-list.component';
import { CompanyFormComponent } from './features/company/company-form/company-form.component';
import { CompanyViewComponent } from './features/company/company-view/company-view.component';
import { CompanyDetailsComponent } from './features/company/company-details/company-details.component';
import { BusinessDaysComponent } from './features/company/business-days/business-days.component';
import { BusinessHoursComponent } from './features/company/business-hours/business-hours.component';
import { HolidaysComponent } from './features/company/holidays/holidays.component';
import { CompanyOverviewViewComponent } from './features/company/company-overview-view/company-overview-view.component';
import { BusinessScheduleViewComponent } from './features/company/business-schedule-view/business-schedule-view.component';

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
      { path: 'permissions', component: PermissionFormComponent },
      { path: 'countries', component: CountryFormComponent },
      { path: 'currencies', component: CurrencyFormComponent },
      { path: 'timezones', component: TimeZoneFormComponent },
      { path: 'dateformats', component: DateFormatFormComponent },
      // Masters routes (placeholder - redirect to dashboard until components are created)
      { path: 'products', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'clients', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'employees', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'departments', redirectTo: 'dashboard', pathMatch: 'full' },
      // Operations routes (placeholder - redirect to dashboard until components are created)
      { path: 'projects', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'worklogs', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'tickets', redirectTo: 'dashboard', pathMatch: 'full' },
      // Ticket Settings routes (placeholder)
      { path: 'ticket-priorities', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'ticket-categories', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'companies', component: CompanyListComponent },
      { 
        path: 'companies/add', 
        component: CompanyFormComponent,
        canDeactivate: [UnsavedChangesGuard],
        children: [
          { path: '', redirectTo: 'company_info', pathMatch: 'full' },
          { path: 'company_info', component: CompanyDetailsComponent },
          { path: 'business_days', component: BusinessDaysComponent },
          { path: 'business_hours', component: BusinessHoursComponent },
          { path: 'holidays', component: HolidaysComponent }
        ]
      },
      { 
        path: 'companies/:id/edit', 
        component: CompanyFormComponent,
        canDeactivate: [UnsavedChangesGuard],
        children: [
          { path: '', redirectTo: 'company_info', pathMatch: 'full' },
          { path: 'company_info', component: CompanyDetailsComponent },
          { path: 'business_days', component: BusinessDaysComponent },
          { path: 'business_hours', component: BusinessHoursComponent },
          { path: 'holidays', component: HolidaysComponent }
        ]
      },
      { 
        path: 'companies/:id', 
        component: CompanyViewComponent,
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: CompanyOverviewViewComponent },
          { path: 'business_days', component: BusinessScheduleViewComponent }
        ]
      }
    ]
  }
];
