import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Permission } from '../../features/permissions/models/permission.model';
import { Module } from '../../features/permissions/models/module.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private mockModules: Module[] = [
    { moduleId: '1', moduleKey: 'Dashboard', moduleName: 'Dashboard', createdAt: new Date(), createdBy: '1' },
    { moduleId: '2', moduleKey: 'Users', moduleName: 'User Management', createdAt: new Date(), createdBy: '1' },
    { moduleId: '3', moduleKey: 'Roles', moduleName: 'Role Management', createdAt: new Date(), createdBy: '1' },
    { moduleId: '4', moduleKey: 'Stations', moduleName: 'Station Management', createdAt: new Date(), createdBy: '1' },
    { moduleId: '5', moduleKey: 'Sales', moduleName: 'Sales & Fuel', createdAt: new Date(), createdBy: '1' },
    { moduleId: '6', moduleKey: 'Reports', moduleName: 'Reports', createdAt: new Date(), createdBy: '1' },
    { moduleId: '7', moduleKey: 'Maintenance', moduleName: 'Maintenance', createdAt: new Date(), createdBy: '1' }
  ];

  private mockPermissions: Permission[] = [
    { permissionId: '1', permissionKey: 'Dashboard.View', permissionName: 'View Dashboard', moduleId: '1', moduleName: 'Dashboard', createdAt: new Date(), createdBy: '1' },
    { permissionId: '2', permissionKey: 'Users.View', permissionName: 'View Users', moduleId: '2', moduleName: 'User Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '3', permissionKey: 'Users.Create', permissionName: 'Create Users', moduleId: '2', moduleName: 'User Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '4', permissionKey: 'Users.Edit', permissionName: 'Edit Users', moduleId: '2', moduleName: 'User Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '5', permissionKey: 'Users.Delete', permissionName: 'Delete Users', moduleId: '2', moduleName: 'User Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '6', permissionKey: 'Roles.View', permissionName: 'View Roles', moduleId: '3', moduleName: 'Role Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '7', permissionKey: 'Roles.Create', permissionName: 'Create Roles', moduleId: '3', moduleName: 'Role Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '8', permissionKey: 'Roles.Edit', permissionName: 'Edit Roles', moduleId: '3', moduleName: 'Role Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '9', permissionKey: 'Roles.Delete', permissionName: 'Delete Roles', moduleId: '3', moduleName: 'Role Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '10', permissionKey: 'Stations.View', permissionName: 'View Stations', moduleId: '4', moduleName: 'Station Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '11', permissionKey: 'Stations.Create', permissionName: 'Create Stations', moduleId: '4', moduleName: 'Station Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '12', permissionKey: 'Stations.Edit', permissionName: 'Edit Stations', moduleId: '4', moduleName: 'Station Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '13', permissionKey: 'Stations.Delete', permissionName: 'Delete Stations', moduleId: '4', moduleName: 'Station Management', createdAt: new Date(), createdBy: '1' },
    { permissionId: '14', permissionKey: 'Sales.View', permissionName: 'View Sales', moduleId: '5', moduleName: 'Sales & Fuel', createdAt: new Date(), createdBy: '1' },
    { permissionId: '15', permissionKey: 'Sales.Create', permissionName: 'Create Sales', moduleId: '5', moduleName: 'Sales & Fuel', createdAt: new Date(), createdBy: '1' },
    { permissionId: '16', permissionKey: 'Sales.Edit', permissionName: 'Edit Sales', moduleId: '5', moduleName: 'Sales & Fuel', createdAt: new Date(), createdBy: '1' },
    { permissionId: '17', permissionKey: 'Reports.View', permissionName: 'View Reports', moduleId: '6', moduleName: 'Reports', createdAt: new Date(), createdBy: '1' },
    { permissionId: '18', permissionKey: 'Reports.Export', permissionName: 'Export Reports', moduleId: '6', moduleName: 'Reports', createdAt: new Date(), createdBy: '1' },
    { permissionId: '19', permissionKey: 'Maintenance.View', permissionName: 'View Maintenance', moduleId: '7', moduleName: 'Maintenance', createdAt: new Date(), createdBy: '1' },
    { permissionId: '20', permissionKey: 'Maintenance.Create', permissionName: 'Create Maintenance', moduleId: '7', moduleName: 'Maintenance', createdAt: new Date(), createdBy: '1' }
  ];

  getPermissions(): Observable<Permission[]> {
    return of(this.mockPermissions).pipe(delay(300));
  }

  getModules(): Observable<Module[]> {
    return of(this.mockModules).pipe(delay(300));
  }

  getPermissionsByModule(moduleId: string): Observable<Permission[]> {
    return of(this.mockPermissions.filter(p => p.moduleId === moduleId)).pipe(delay(300));
  }

  createPermission(permission: Partial<Permission>): Observable<Permission> {
    const module = this.mockModules.find(m => m.moduleId === permission.moduleId);
    const newPermission: Permission = {
      permissionId: (this.mockPermissions.length + 1).toString(),
      permissionKey: permission.permissionKey || '',
      permissionName: permission.permissionName || '',
      moduleId: permission.moduleId || '',
      moduleName: module?.moduleName,
      createdAt: new Date(),
      createdBy: '1'
    };
    this.mockPermissions.push(newPermission);
    return of(newPermission).pipe(delay(300));
  }
}
