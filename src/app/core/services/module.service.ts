import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Module } from '../../features/modules/models/module.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private mockModules: Module[] = [
    {
      moduleId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      moduleKey: 'DASHBOARD',
      moduleName: 'Dashboard',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-20'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
      moduleKey: 'ADMIN',
      moduleName: 'Administration',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-15'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
      moduleKey: 'USER_MGMT',
      moduleName: 'User Management',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-18'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
      moduleKey: 'ROLE_MGMT',
      moduleName: 'Role Management',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-10'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
      moduleKey: 'REPORTS',
      moduleName: 'Reports',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-03-10'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-10-25'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
      moduleKey: 'ANALYTICS',
      moduleName: 'Analytics',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-03-15'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-01'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
      moduleKey: 'SETTINGS',
      moduleName: 'Settings',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-20'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-12'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w',
      moduleKey: 'BILLING',
      moduleName: 'Billing',
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-04-05'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-09-20'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x',
      moduleKey: 'INVENTORY',
      moduleName: 'Inventory',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-05-12'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-10-30'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '0j1k2l3m-4n5o-6p7q-8r9s-0t1u2v3w4x5y',
      moduleKey: 'CRM',
      moduleName: 'Customer Relationship Management',
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-06-01'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-08-15'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '1k2l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z',
      moduleKey: 'NOTIFICATIONS',
      moduleName: 'Notifications',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-02-20'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-11-05'),
      updatedBy: 'admin-user-id'
    },
    {
      moduleId: '2l3m4n5o-6p7q-8r9s-0t1u-2v3w4x5y6z7a',
      moduleKey: 'AUDIT',
      moduleName: 'Audit Logs',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-25'),
      createdBy: 'admin-user-id',
      updatedAt: new Date('2024-10-10'),
      updatedBy: 'admin-user-id'
    }
  ];

  constructor() { }

  getModules(): Observable<Module[]> {
    return of(this.mockModules.filter(m => !m.isDeleted)).pipe(delay(300));
  }

  getModuleById(id: string): Observable<Module> {
    const module = this.mockModules.find(m => m.moduleId === id && !m.isDeleted);
    if (module) {
      return of(module).pipe(delay(200));
    }
    return throwError(() => new Error('Module not found'));
  }

  createModule(module: Module): Observable<Module> {
    const newModule: Module = {
      ...module,
      moduleId: crypto.randomUUID(),
      createdAt: new Date(),
      createdBy: 'current-user-id',
      isDeleted: false
    };
    this.mockModules.push(newModule);
    return of(newModule).pipe(delay(500));
  }

  updateModule(id: string, module: Module): Observable<Module> {
    const index = this.mockModules.findIndex(m => m.moduleId === id);
    if (index !== -1) {
      const updatedModule: Module = {
        ...this.mockModules[index],
        ...module,
        moduleId: id,
        updatedAt: new Date(),
        updatedBy: 'current-user-id'
      };
      this.mockModules[index] = updatedModule;
      return of(updatedModule).pipe(delay(500));
    }
    return throwError(() => new Error('Module not found'));
  }

  deleteModule(id: string): Observable<void> {
    const index = this.mockModules.findIndex(m => m.moduleId === id);
    if (index !== -1) {
      this.mockModules[index].isDeleted = true;
      return of(void 0).pipe(delay(300));
    }
    return throwError(() => new Error('Module not found'));
  }

  checkModuleKeyExists(key: string, excludeId?: string): boolean {
    return this.mockModules.some(m => 
      m.moduleKey === key.toUpperCase() && 
      !m.isDeleted && 
      m.moduleId !== excludeId
    );
  }
}
