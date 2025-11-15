import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Role } from '../../features/roles/models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private mockRoles: Role[] = [
    {
      roleId: '1',
      roleName: 'Super Admin',
      description: 'Full system access with all permissions',
      createdAt: new Date('2024-01-01'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '2',
      roleName: 'Station Manager',
      description: 'Manage station operations and staff',
      createdAt: new Date('2024-01-05'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '3',
      roleName: 'Sales Manager',
      description: 'Manage sales and fuel operations',
      createdAt: new Date('2024-01-10'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '4',
      roleName: 'Accountant',
      description: 'Handle financial transactions and reports',
      createdAt: new Date('2024-01-15'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '5',
      roleName: 'Operator',
      description: 'Basic operational access',
      createdAt: new Date('2024-01-20'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '6',
      roleName: 'Viewer',
      description: 'Read-only access to reports',
      createdAt: new Date('2024-02-01'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '7',
      roleName: 'Maintenance Staff',
      description: 'Manage equipment maintenance',
      createdAt: new Date('2024-02-10'),
      createdBy: '1',
      permissions: []
    },
    {
      roleId: '8',
      roleName: 'Auditor',
      description: 'Audit and compliance access',
      createdAt: new Date('2024-02-15'),
      createdBy: '1',
      permissions: []
    }
  ];

  getRoles(): Observable<Role[]> {
    return of(this.mockRoles).pipe(delay(300));
  }

  getRoleById(id: string): Observable<Role | undefined> {
    return of(this.mockRoles.find(r => r.roleId === id)).pipe(delay(300));
  }

  createRole(role: Partial<Role>): Observable<Role> {
    const newRole: Role = {
      roleId: (this.mockRoles.length + 1).toString(),
      roleName: role.roleName || '',
      description: role.description,
      createdAt: new Date(),
      createdBy: '1',
      permissions: []
    };
    this.mockRoles.push(newRole);
    return of(newRole).pipe(delay(300));
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role | undefined> {
    const index = this.mockRoles.findIndex(r => r.roleId === id);
    if (index !== -1) {
      this.mockRoles[index] = { ...this.mockRoles[index], ...role, updatedAt: new Date(), updatedBy: '1' };
      return of(this.mockRoles[index]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteRole(id: string): Observable<boolean> {
    const index = this.mockRoles.findIndex(r => r.roleId === id);
    if (index !== -1) {
      this.mockRoles.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
