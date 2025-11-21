import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Role } from '../models/role.model';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class RoleFormComponent implements OnInit {
  role = input<Role | null>(null);
  mode = input<'add' | 'edit' | 'view'>('add');
  formSubmit = output<Role>();
  cancel = output<void>();

  private fb = new FormBuilder();
  private roleService = inject(RoleService);
  router = inject(Router);
  
  roleForm: FormGroup;
  activeTab = signal(0);
  allRoles = signal<Role[]>([]);
  selectedRoleId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeRolesCount = computed(() => this.allRoles().filter(r => r.status === 'Active').length);
  inactiveRolesCount = computed(() => this.allRoles().filter(r => r.status === 'Inactive').length);

  constructor() {
    this.roleForm = this.fb.group({
      roleId: [''],
      roleName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      status: [true]
    });

    effect(() => {
      const currentRole = this.role();
      if (currentRole) {
        this.selectedRoleId.set(currentRole.roleId);
        this.roleForm.patchValue({
          roleId: currentRole.roleId,
          roleName: currentRole.roleName,
          description: currentRole.description || '',
          status: currentRole.status === 'Active'
        });
      }
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedRoleId()) {
        this.roleForm.disable();
      } else if (this.isInEditMode()) {
        this.roleForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllRoles();
  }

  loadAllRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.allRoles.set(roles);
        if (roles.length > 0 && !this.role()) {
          const firstRole = roles[0];
          this.selectedRoleId.set(firstRole.roleId);
          if (!this.role()) {
            this.loadRoleDetails(firstRole.roleId);
          }
        }
      },
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  private loadRoleDetails(roleId: string): void {
    this.roleService.getRoleById(roleId).subscribe({
      next: (role) => {
        if (role) {
          this.populateForm(role);
        }
      },
      error: (err) => console.error('Error loading role details:', err)
    });
  }

  private populateForm(role: Role): void {
    this.roleForm.patchValue({
      roleId: role.roleId,
      roleName: role.roleName,
      description: role.description || '',
      status: role.status === 'Active'
    });
  }

  filteredSidebarRoles = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const roles = this.allRoles();
    if (!term) return roles;
    return roles.filter(r => r.roleName.toLowerCase().includes(term) || (r.description?.toLowerCase() || '').includes(term));
  });

  selectRole(role: Role): void {
    this.selectedRoleId.set(role.roleId);
    this.populateForm(role);
    this.isInEditMode.set(false);
    this.roleForm.disable();
  }

  addNewRole(): void {
    this.selectedRoleId.set(null);
    this.roleForm.reset({ roleId: '', roleName: '', description: '', status: true });
    this.isInEditMode.set(true);
    this.roleForm.enable();
    this.setActiveTab(0);
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      const roleData: Role = {
        roleId: formValue.roleId || crypto.randomUUID(),
        roleName: formValue.roleName,
        description: formValue.description,
        status: formValue.status ? 'Active' : 'Inactive',
        createdAt: this.role()?.createdAt || new Date(),
        createdBy: this.role()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
        permissions: this.role()?.permissions || []
      };
      
      if (this.selectedRoleId()) {
        this.roleService.updateRole(roleData.roleId, roleData).subscribe({
          next: () => {
            this.loadAllRoles();
            this.populateForm(roleData);
            this.isInEditMode.set(false);
            this.roleForm.disable();
          },
          error: (err) => console.error('Error updating role:', err)
        });
      } else {
        this.roleService.createRole(roleData).subscribe({
          next: (newRole) => {
            this.loadAllRoles();
            this.selectedRoleId.set(newRole.roleId);
            this.populateForm(newRole);
            this.isInEditMode.set(false);
            this.roleForm.disable();
          },
          error: (err) => console.error('Error creating role:', err)
        });
      }
      this.formSubmit.emit(roleData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }

  toggleViewMode(mode: 'cards' | 'list'): void {
    this.viewMode.set(mode);
  }

  enableEditMode(): void {
    this.isInEditMode.set(true);
    this.roleForm.enable();
  }

  cancelEdit(): void {
    const currentRoleId = this.selectedRoleId();
    if (currentRoleId) {
      this.loadRoleDetails(currentRoleId);
    }
    this.isInEditMode.set(false);
    this.roleForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/roles']);
  }

  get permissionCount(): number {
    return this.role()?.permissions?.length || 0;
  }

  roleName = computed(() => this.role()?.roleName || 'Role');

  get formTitle(): string {
    if (!this.selectedRoleId()) {
      return 'New Role';
    }
    const selectedRole = this.allRoles().find(r => r.roleId === this.selectedRoleId());
    return selectedRole?.roleName || 'Role';
  }

  getRoleIcon(roleName: string): string {
    return '👤';
  }

  getRoleCardColor(roleName: string): string {
    const colors: Record<string, string> = {
      'Admin': 'bg-purple-50',
      'Administrator': 'bg-purple-50',
      'User': 'bg-blue-50',
      'Manager': 'bg-indigo-50',
      'Developer': 'bg-green-50',
      'Support': 'bg-cyan-50',
      'Sales': 'bg-orange-50',
      'Marketing': 'bg-pink-50',
      'HR': 'bg-teal-50',
      'Finance': 'bg-emerald-50'
    };
    return colors[roleName] || 'bg-gray-50';
  }

  getCreatedDate(): string | null {
    const selectedRole = this.allRoles().find(r => r.roleId === this.selectedRoleId());
    return selectedRole ? new Date().toISOString() : null;
  }
}