import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-list',
  imports: [CommonModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  
  roles = signal<Role[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading.set(false);
      }
    });
  }

  deleteRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(roleId).subscribe({
        next: (success) => {
          if (success) {
            this.loadRoles();
          }
        },
        error: (err) => console.error('Error deleting role:', err)
      });
    }
  }

  getRoleIcon(roleName: string): string {
    const lowerName = roleName.toLowerCase();
    if (lowerName.includes('admin')) return '👑';
    if (lowerName.includes('manager')) return '📊';
    if (lowerName.includes('sales')) return '💰';
    if (lowerName.includes('account')) return '📈';
    if (lowerName.includes('operator')) return '⚙️';
    if (lowerName.includes('viewer')) return '👁️';
    if (lowerName.includes('maintenance')) return '🔧';
    if (lowerName.includes('audit')) return '📋';
    return '🔐';
  }
}
