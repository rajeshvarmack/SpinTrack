import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Permission } from '../../features/permissions/models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private permissions: Permission[] = [
    { permissionId: '1', subModuleId: '1', subModuleName: 'Dashboard Overview', moduleName: 'Dashboard', permissionKey: 'DASHBOARD_OVERVIEW_VIEW', permissionName: 'View Dashboard Overview', status: 'Active', createdAt: new Date('2024-01-15'), createdBy: 'system' },
    { permissionId: '2', subModuleId: '1', subModuleName: 'Dashboard Overview', moduleName: 'Dashboard', permissionKey: 'DASHBOARD_OVERVIEW_EXPORT', permissionName: 'Export Dashboard Data', status: 'Active', createdAt: new Date('2024-01-15'), createdBy: 'system' },
    { permissionId: '3', subModuleId: '2', subModuleName: 'Dashboard Analytics', moduleName: 'Dashboard', permissionKey: 'DASHBOARD_ANALYTICS_VIEW', permissionName: 'View Analytics', status: 'Active', createdAt: new Date('2024-01-15'), createdBy: 'system' },
    { permissionId: '4', subModuleId: '2', subModuleName: 'Dashboard Analytics', moduleName: 'Dashboard', permissionKey: 'DASHBOARD_ANALYTICS_EDIT', permissionName: 'Edit Analytics Configuration', status: 'Active', createdAt: new Date('2024-01-15'), createdBy: 'system' },
    { permissionId: '5', subModuleId: '3', subModuleName: 'Admin Users', moduleName: 'Administration', permissionKey: 'ADMIN_USERS_VIEW', permissionName: 'View Users', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '6', subModuleId: '3', subModuleName: 'Admin Users', moduleName: 'Administration', permissionKey: 'ADMIN_USERS_CREATE', permissionName: 'Create User', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '7', subModuleId: '3', subModuleName: 'Admin Users', moduleName: 'Administration', permissionKey: 'ADMIN_USERS_EDIT', permissionName: 'Edit User', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '8', subModuleId: '3', subModuleName: 'Admin Users', moduleName: 'Administration', permissionKey: 'ADMIN_USERS_DELETE', permissionName: 'Delete User', status: 'Inactive', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '9', subModuleId: '4', subModuleName: 'Admin Roles', moduleName: 'Administration', permissionKey: 'ADMIN_ROLES_VIEW', permissionName: 'View Roles', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '10', subModuleId: '4', subModuleName: 'Admin Roles', moduleName: 'Administration', permissionKey: 'ADMIN_ROLES_CREATE', permissionName: 'Create Role', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '11', subModuleId: '4', subModuleName: 'Admin Roles', moduleName: 'Administration', permissionKey: 'ADMIN_ROLES_EDIT', permissionName: 'Edit Role', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '12', subModuleId: '4', subModuleName: 'Admin Roles', moduleName: 'Administration', permissionKey: 'ADMIN_ROLES_DELETE', permissionName: 'Delete Role', status: 'Active', createdAt: new Date('2024-01-16'), createdBy: 'system' },
    { permissionId: '13', subModuleId: '7', subModuleName: 'User Profile', moduleName: 'User Management', permissionKey: 'USER_PROFILE_VIEW', permissionName: 'View Profile', status: 'Active', createdAt: new Date('2024-01-17'), createdBy: 'system' },
    { permissionId: '14', subModuleId: '7', subModuleName: 'User Profile', moduleName: 'User Management', permissionKey: 'USER_PROFILE_EDIT', permissionName: 'Edit Profile', status: 'Active', createdAt: new Date('2024-01-17'), createdBy: 'system' },
    { permissionId: '15', subModuleId: '8', subModuleName: 'Reports Sales', moduleName: 'Reports', permissionKey: 'REPORTS_SALES_VIEW', permissionName: 'View Sales Reports', status: 'Active', createdAt: new Date('2024-01-18'), createdBy: 'system' }
  ];

  getPermissions(): Observable<Permission[]> {
    return of([...this.permissions]).pipe(delay(300));
  }

  getPermissionById(id: string): Observable<Permission | undefined> {
    const permission = this.permissions.find(p => p.permissionId === id);
    return of(permission ? { ...permission } : undefined).pipe(delay(200));
  }

  getPermissionsBySubModuleId(subModuleId: string): Observable<Permission[]> {
    const filtered = this.permissions.filter(p => p.subModuleId === subModuleId);
    return of([...filtered]).pipe(delay(200));
  }

  createPermission(permission: Permission): Observable<Permission> {
    const newPermission = {
      ...permission,
      permissionId: crypto.randomUUID(),
      createdAt: new Date(),
      createdBy: 'system'
    };
    this.permissions.push(newPermission);
    return of({ ...newPermission }).pipe(delay(300));
  }

  updatePermission(id: string, permission: Permission): Observable<Permission> {
    const index = this.permissions.findIndex(p => p.permissionId === id);
    if (index !== -1) {
      this.permissions[index] = {
        ...permission,
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      return of({ ...this.permissions[index] }).pipe(delay(300));
    }
    throw new Error('Permission not found');
  }

  deletePermission(id: string): Observable<boolean> {
    const index = this.permissions.findIndex(p => p.permissionId === id);
    if (index !== -1) {
      this.permissions.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  checkPermissionKeyExists(key: string, excludeId?: string): boolean {
    return this.permissions.some(p => 
      p.permissionKey === key && p.permissionId !== excludeId
    );
  }
}
