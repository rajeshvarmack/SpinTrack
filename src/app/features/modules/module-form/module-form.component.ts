import { Component, OnInit, effect, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Module } from '../models/module.model';
import { ModuleService } from '../../../core/services/module.service';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './module-form.component.html',
  styleUrl: './module-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private moduleService = inject(ModuleService);
  private router = inject(Router);
  
  moduleForm: FormGroup;
  allModules = signal<Module[]>([]);
  selectedModuleId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);
  loading = signal(false);

  // Computed counts for Active/Inactive modules
  activeModulesCount = computed(() => 
    this.allModules().filter(m => m.status === 'Active').length
  );
  
  inactiveModulesCount = computed(() => 
    this.allModules().filter(m => m.status === 'Inactive').length
  );

  constructor() {
    this.moduleForm = this.fb.group({
      moduleId: [''],
      moduleName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      moduleKey: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[A-Z_]+$/)]],
      status: [true, Validators.required]
    });

    // Auto-uppercase module key
    this.moduleForm.get('moduleKey')?.valueChanges.subscribe(value => {
      if (value) {
        const uppercased = value.toUpperCase().replace(/\s/g, '_');
        if (value !== uppercased) {
          this.moduleForm.get('moduleKey')?.setValue(uppercased, { emitEvent: false });
        }
      }
    });

    // Handle read-only mode for view
    effect(() => {
      if (!this.isInEditMode() && this.selectedModuleId()) {
        this.moduleForm.disable();
      } else if (this.isInEditMode()) {
        this.moduleForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllModules();
  }

  loadAllModules(): void {
    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.allModules.set(modules);
        
        // Auto-select first module if available and no module is currently selected
        if (modules.length > 0 && !this.selectedModuleId()) {
          const firstModule = modules[0];
          this.selectedModuleId.set(firstModule.moduleId);
          this.loadModuleDetails(firstModule.moduleId);
        }
      },
      error: (err) => {
        console.error('Error loading modules:', err);
      }
    });
  }

  private loadModuleDetails(moduleId: string): void {
    this.moduleService.getModuleById(moduleId).subscribe({
      next: (module) => {
        if (module) {
          this.populateForm(module);
        }
      },
      error: (err) => {
        console.error('Error loading module details:', err);
      }
    });
  }

  private populateForm(module: Module): void {
    this.moduleForm.patchValue({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      moduleKey: module.moduleKey,
      status: module.status === 'Active'
    });
  }

  filteredSidebarModules = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const modules = this.allModules();
    if (!term) return modules;
    return modules.filter(m => 
      m.moduleName.toLowerCase().includes(term) ||
      m.moduleKey.toLowerCase().includes(term)
    );
  });

  selectModule(module: Module): void {
    this.selectedModuleId.set(module.moduleId);
    this.populateForm(module);
    this.isInEditMode.set(false);
    this.moduleForm.disable();
  }

  addNewModule(): void {
    this.selectedModuleId.set(null);
    this.moduleForm.reset({
      moduleId: '',
      moduleName: '',
      moduleKey: '',
      status: true
    });
    this.isInEditMode.set(true);
    this.moduleForm.enable();
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    const formValue = this.moduleForm.value;
    const moduleData: Partial<Module> = {
      moduleName: formValue.moduleName,
      moduleKey: formValue.moduleKey,
      status: formValue.status ? 'Active' : 'Inactive'
    };

    // Check for duplicate module key
    if (this.moduleService.checkModuleKeyExists(moduleData.moduleKey!, this.selectedModuleId() || undefined)) {
      alert(`Module key "${moduleData.moduleKey}" already exists. Please use a different key.`);
      return;
    }

    this.loading.set(true);

    if (this.selectedModuleId()) {
      // Update existing module
      this.moduleService.updateModule(this.selectedModuleId()!, { 
        ...moduleData,
        moduleId: this.selectedModuleId()!
      } as Module).subscribe({
        next: (updatedModule) => {
          this.loadAllModules();
          this.populateForm(updatedModule);
          this.isInEditMode.set(false);
          this.moduleForm.disable();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error updating module:', err);
          this.loading.set(false);
        }
      });
    } else {
      // Create new module
      this.moduleService.createModule(moduleData as Module).subscribe({
        next: (newModule) => {
          this.loadAllModules();
          this.selectedModuleId.set(newModule.moduleId);
          this.populateForm(newModule);
          this.isInEditMode.set(false);
          this.moduleForm.disable();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error creating module:', err);
          this.loading.set(false);
        }
      });
    }
  }

  enableEditMode(): void {
    this.isInEditMode.set(true);
    this.moduleForm.enable();
  }

  cancelEdit(): void {
    const currentModuleId = this.selectedModuleId();
    if (currentModuleId) {
      this.loadModuleDetails(currentModuleId);
    }
    this.isInEditMode.set(false);
    this.moduleForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleViewMode(mode: 'cards' | 'list'): void {
    this.viewMode.set(mode);
  }

  get formTitle(): string {
    if (!this.selectedModuleId()) {
      return 'New Module';
    }
    const selectedModule = this.allModules().find(m => m.moduleId === this.selectedModuleId());
    return selectedModule?.moduleName || 'Module';
  }

  getModuleIcon(moduleKey: string): string {
    return '📦';
  }

  getModuleIconColor(moduleKey: string): string {
    const colors: { [key: string]: string } = {
      'DASHBOARD': 'bg-blue-100',
      'ADMIN': 'bg-purple-100',
      'USER_MGMT': 'bg-green-100',
      'ROLE_MGMT': 'bg-indigo-100',
      'REPORTS': 'bg-yellow-100',
      'ANALYTICS': 'bg-pink-100',
      'SETTINGS': 'bg-gray-100',
      'BILLING': 'bg-emerald-100',
      'INVENTORY': 'bg-orange-100',
      'CRM': 'bg-cyan-100',
      'NOTIFICATIONS': 'bg-rose-100',
      'AUDIT': 'bg-lime-100'
    };
    return colors[moduleKey] || 'bg-gray-100';
  }

  getModuleCardColor(moduleKey: string): string {
    const colors: { [key: string]: string } = {
      'DASHBOARD': 'bg-blue-50',
      'ADMIN': 'bg-purple-50',
      'USER_MGMT': 'bg-green-50',
      'ROLE_MGMT': 'bg-indigo-50',
      'REPORTS': 'bg-yellow-50',
      'ANALYTICS': 'bg-pink-50',
      'SETTINGS': 'bg-gray-50',
      'BILLING': 'bg-emerald-50',
      'INVENTORY': 'bg-orange-50',
      'CRM': 'bg-cyan-50',
      'NOTIFICATIONS': 'bg-rose-50',
      'AUDIT': 'bg-lime-50'
    };
    return colors[moduleKey] || 'bg-gray-50';
  }

  getCreatedDate(): string | null {
    const selectedModule = this.allModules().find(m => m.moduleId === this.selectedModuleId());
    return selectedModule ? new Date().toISOString() : null;
  }
}
