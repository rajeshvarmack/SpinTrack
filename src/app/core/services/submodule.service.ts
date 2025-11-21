import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SubModule } from '../../features/submodules/models/submodule.model';

@Injectable({
  providedIn: 'root'
})
export class SubModuleService {
  private mockSubModules: SubModule[] = [
    {
      subModuleId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      moduleId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      moduleName: 'Dashboard',
      subModuleKey: 'DASHBOARD_OVERVIEW',
      subModuleName: 'Overview',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-20'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      moduleId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      moduleName: 'Dashboard',
      subModuleKey: 'DASHBOARD_ANALYTICS',
      subModuleName: 'Analytics',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-16'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-18'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
      moduleId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      moduleName: 'Administration',
      subModuleKey: 'ADMIN_USERS',
      subModuleName: 'User Management',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-19'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
      moduleId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      moduleName: 'Administration',
      subModuleKey: 'ADMIN_ROLES',
      subModuleName: 'Role Management',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-17'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
      moduleId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      moduleName: 'Administration',
      subModuleKey: 'ADMIN_PERMISSIONS',
      subModuleName: 'Permission Management',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-02'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-16'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
      moduleId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
      moduleName: 'User Management',
      subModuleKey: 'USER_LIST',
      subModuleName: 'User List',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-05'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-15'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
      moduleId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
      moduleName: 'User Management',
      subModuleKey: 'USER_PROFILE',
      subModuleName: 'User Profile',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-05'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-14'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w',
      moduleId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
      moduleName: 'Reports',
      subModuleKey: 'REPORTS_SALES',
      subModuleName: 'Sales Reports',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-03-10'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-13'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x',
      moduleId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
      moduleName: 'Reports',
      subModuleKey: 'REPORTS_FINANCIAL',
      subModuleName: 'Financial Reports',
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-03-11'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-10-20'),
      updatedBy: 'admin-user-id'
    },
    {
      subModuleId: '0j1k2l3m-4n5o-6p7q-8r9s-0t1u2v3w4x5y',
      moduleId: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
      moduleName: 'Settings',
      subModuleKey: 'SETTINGS_GENERAL',
      subModuleName: 'General Settings',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-20'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-12'),
      updatedBy: 'admin-user-id'
    }
  ];

  constructor() { }

  getSubModules(): Observable<SubModule[]> {
    return of(this.mockSubModules.filter(sm => !sm.isDeleted)).pipe(delay(300));
  }

  getSubModuleById(id: string): Observable<SubModule> {
    const subModule = this.mockSubModules.find(sm => sm.subModuleId === id && !sm.isDeleted);
    if (subModule) {
      return of(subModule).pipe(delay(200));
    }
    return throwError(() => new Error('SubModule not found'));
  }

  createSubModule(subModule: SubModule): Observable<SubModule> {
    const newSubModule: SubModule = {
      ...subModule,
      subModuleId: crypto.randomUUID(),
      createdAt: new Date(),
      createdBy: 'current-user-id',
      isDeleted: false
    };
    this.mockSubModules.push(newSubModule);
    return of(newSubModule).pipe(delay(500));
  }

  updateSubModule(id: string, subModule: SubModule): Observable<SubModule> {
    const index = this.mockSubModules.findIndex(sm => sm.subModuleId === id);
    if (index !== -1) {
      const updatedSubModule: SubModule = {
        ...this.mockSubModules[index],
        ...subModule,
        subModuleId: id,
        updatedAt: new Date(),
        updatedBy: 'current-user-id'
      };
      this.mockSubModules[index] = updatedSubModule;
      return of(updatedSubModule).pipe(delay(500));
    }
    return throwError(() => new Error('SubModule not found'));
  }

  deleteSubModule(id: string): Observable<void> {
    const index = this.mockSubModules.findIndex(sm => sm.subModuleId === id);
    if (index !== -1) {
      this.mockSubModules[index].isDeleted = true;
      return of(void 0).pipe(delay(300));
    }
    return throwError(() => new Error('SubModule not found'));
  }

  checkSubModuleKeyExists(key: string, excludeId?: string): boolean {
    return this.mockSubModules.some(sm => 
      sm.subModuleKey === key.toUpperCase() && 
      !sm.isDeleted && 
      sm.subModuleId !== excludeId
    );
  }

  getSubModulesByModuleId(moduleId: string): Observable<SubModule[]> {
    return of(this.mockSubModules.filter(sm => sm.moduleId === moduleId && !sm.isDeleted)).pipe(delay(300));
  }
}
