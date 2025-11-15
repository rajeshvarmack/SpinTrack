import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission, Module } from '../../../core/models/user.model';

@Component({
  selector: 'app-permission-list',
  imports: [CommonModule],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionListComponent implements OnInit {
  private permissionService = inject(PermissionService);
  
  permissions = signal<Permission[]>([]);
  modules = signal<Module[]>([]);
  loading = signal(true);
  selectedModule = signal('all');
  
  groupedPermissions = computed(() => {
    const grouped = new Map<string, Permission[]>();
    this.permissions().forEach(permission => {
      const moduleName = permission.moduleName || 'Unknown';
      if (!grouped.has(moduleName)) {
        grouped.set(moduleName, []);
      }
      grouped.get(moduleName)?.push(permission);
    });
    return grouped;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions);
      },
      error: (err) => console.error('Error loading permissions:', err)
    });

    this.permissionService.getModules().subscribe({
      next: (modules) => {
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading modules:', err);
        this.loading.set(false);
      }
    });
  }

  getModuleIcon(moduleName: string): string {
    const lower = moduleName.toLowerCase();
    if (lower.includes('dashboard')) return '📊';
    if (lower.includes('user')) return '👥';
    if (lower.includes('role')) return '🔐';
    if (lower.includes('station')) return '⛽';
    if (lower.includes('sales') || lower.includes('fuel')) return '💰';
    if (lower.includes('report')) return '📄';
    if (lower.includes('maintenance')) return '🔧';
    return '📦';
  }

  getPermissionTypeColor(permissionKey: string): string {
    if (permissionKey.includes('View')) return 'bg-primary-100 text-primary-700';
    if (permissionKey.includes('Create')) return 'bg-success-100 text-success-700';
    if (permissionKey.includes('Edit')) return 'bg-warning-100 text-warning-700';
    if (permissionKey.includes('Delete')) return 'bg-danger-100 text-danger-700';
    return 'bg-gray-100 text-gray-700';
  }

  getGroupedPermissionsArray() {
    return Array.from(this.groupedPermissions().entries());
  }

  getReadPermissionCount(): number {
    return this.permissions().filter(p => p.permissionKey.includes('View')).length;
  }

  getWritePermissionCount(): number {
    return this.permissions().filter(p => p.permissionKey.includes('Create') || p.permissionKey.includes('Edit')).length;
  }
}
