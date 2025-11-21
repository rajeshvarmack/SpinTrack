import { Component, ChangeDetectionStrategy, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Permission } from '../models/permission.model';
import { PermissionService } from '../../../core/services/permission.service';
import { SubModuleService } from '../../../core/services/submodule.service';
import { SubModule } from '../../submodules/models/submodule.model';

@Component({
  selector: 'app-permission-form',
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule]
})
export class PermissionFormComponent implements OnInit {
  private fb = new FormBuilder();
  private permissionService = inject(PermissionService);
  private subModuleService = inject(SubModuleService);
  router = inject(Router);
  
  permissionForm: FormGroup;
  allPermissions = signal<Permission[]>([]);
  allSubModules = signal<SubModule[]>([]);
  selectedPermissionId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activePermissionsCount = computed(() => this.allPermissions().filter(p => p.status === 'Active').length);
  inactivePermissionsCount = computed(() => this.allPermissions().filter(p => p.status === 'Inactive').length);

  constructor() {
    this.permissionForm = this.fb.group({
      permissionId: [''],
      subModuleId: ['', Validators.required],
      permissionKey: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
      permissionName: ['', [Validators.required, Validators.minLength(3)]],
      status: [true]
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedPermissionId()) {
        this.permissionForm.disable();
      } else if (this.isInEditMode()) {
        this.permissionForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllSubModules();
    this.loadAllPermissions();
  }

  loadAllSubModules(): void {
    this.subModuleService.getSubModules().subscribe({
      next: (subModules) => this.allSubModules.set(subModules),
      error: (err) => console.error('Error loading submodules:', err)
    });
  }

  loadAllPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions.set(permissions);
        if (permissions.length > 0 && !this.selectedPermissionId()) {
          const firstPermission = permissions[0];
          this.selectedPermissionId.set(firstPermission.permissionId);
          this.loadPermissionDetails(firstPermission.permissionId);
        }
      },
      error: (err) => console.error('Error loading permissions:', err)
    });
  }

  private loadPermissionDetails(permissionId: string): void {
    this.permissionService.getPermissionById(permissionId).subscribe({
      next: (permission) => {
        if (permission) {
          this.populateForm(permission);
        }
      },
      error: (err) => console.error('Error loading permission details:', err)
    });
  }

  private populateForm(permission: Permission): void {
    this.permissionForm.patchValue({
      permissionId: permission.permissionId,
      subModuleId: permission.subModuleId,
      permissionKey: permission.permissionKey,
      permissionName: permission.permissionName,
      status: permission.status === 'Active'
    });
  }

  filteredSidebarPermissions = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const permissions = this.allPermissions();
    if (!term) return permissions;
    return permissions.filter(p => 
      p.permissionName.toLowerCase().includes(term) || 
      p.permissionKey.toLowerCase().includes(term) ||
      p.subModuleName?.toLowerCase().includes(term) ||
      p.moduleName?.toLowerCase().includes(term)
    );
  });

  selectPermission(permission: Permission): void {
    this.selectedPermissionId.set(permission.permissionId);
    this.populateForm(permission);
    this.isInEditMode.set(false);
    this.permissionForm.disable();
  }

  addNewPermission(): void {
    this.selectedPermissionId.set(null);
    this.permissionForm.reset({ permissionId: '', subModuleId: '', permissionKey: '', permissionName: '', status: true });
    this.isInEditMode.set(true);
    this.permissionForm.enable();
  }

  onSubmit(): void {
    if (this.permissionForm.valid) {
      const formValue = this.permissionForm.value;
      const selectedSubModule = this.allSubModules().find(sm => sm.subModuleId === formValue.subModuleId);
      
      const permissionData: Permission = {
        permissionId: formValue.permissionId || crypto.randomUUID(),
        subModuleId: formValue.subModuleId,
        subModuleName: selectedSubModule?.subModuleName,
        moduleName: selectedSubModule?.moduleName,
        permissionKey: formValue.permissionKey.toUpperCase(),
        permissionName: formValue.permissionName,
        status: formValue.status ? 'Active' : 'Inactive',
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedPermissionId()) {
        this.permissionService.updatePermission(permissionData.permissionId, permissionData).subscribe({
          next: () => {
            this.loadAllPermissions();
            this.populateForm(permissionData);
            this.isInEditMode.set(false);
            this.permissionForm.disable();
          },
          error: (err) => console.error('Error updating permission:', err)
        });
      } else {
        this.permissionService.createPermission(permissionData).subscribe({
          next: (newPermission) => {
            this.loadAllPermissions();
            this.selectedPermissionId.set(newPermission.permissionId);
            this.populateForm(newPermission);
            this.isInEditMode.set(false);
            this.permissionForm.disable();
          },
          error: (err) => console.error('Error creating permission:', err)
        });
      }
    }
  }

  toggleViewMode(mode: 'cards' | 'list'): void {
    this.viewMode.set(mode);
  }

  enableEditMode(): void {
    this.isInEditMode.set(true);
    this.permissionForm.enable();
  }

  cancelEdit(): void {
    const currentPermissionId = this.selectedPermissionId();
    if (currentPermissionId) {
      this.loadPermissionDetails(currentPermissionId);
    }
    this.isInEditMode.set(false);
    this.permissionForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/dashboard']);
  }

  get formTitle(): string {
    if (!this.selectedPermissionId()) {
      return 'New Permission';
    }
    const selectedPermission = this.allPermissions().find(p => p.permissionId === this.selectedPermissionId());
    return selectedPermission?.permissionName || 'Permission';
  }

  getPermissionIcon(): string {
    return '🔑';
  }

  getPermissionIconColor(): string {
    return 'bg-purple-100';
  }

  getPermissionCardColor(): string {
    return 'bg-purple-50';
  }

  getSubModuleName(subModuleId: string): string {
    const subModule = this.allSubModules().find(sm => sm.subModuleId === subModuleId);
    return subModule?.subModuleName || 'Unknown SubModule';
  }
}
