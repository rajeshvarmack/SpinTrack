import { Component, ChangeDetectionStrategy, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SubModule } from '../models/submodule.model';
import { SubModuleService } from '../../../core/services/submodule.service';
import { ModuleService } from '../../../core/services/module.service';
import { Module } from '../../modules/models/module.model';

@Component({
  selector: 'app-submodule-form',
  templateUrl: './submodule-form.component.html',
  styleUrls: ['./submodule-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule]
})
export class SubModuleFormComponent implements OnInit {
  private fb = new FormBuilder();
  private subModuleService = inject(SubModuleService);
  private moduleService = inject(ModuleService);
  router = inject(Router);
  
  subModuleForm: FormGroup;
  allSubModules = signal<SubModule[]>([]);
  allModules = signal<Module[]>([]);
  selectedSubModuleId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeSubModulesCount = computed(() => this.allSubModules().filter(sm => sm.status === 'Active').length);
  inactiveSubModulesCount = computed(() => this.allSubModules().filter(sm => sm.status === 'Inactive').length);

  constructor() {
    this.subModuleForm = this.fb.group({
      subModuleId: [''],
      moduleId: ['', Validators.required],
      subModuleKey: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
      subModuleName: ['', [Validators.required, Validators.minLength(3)]],
      status: [true]
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedSubModuleId()) {
        this.subModuleForm.disable();
      } else if (this.isInEditMode()) {
        this.subModuleForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllModules();
    this.loadAllSubModules();
  }

  loadAllModules(): void {
    this.moduleService.getModules().subscribe({
      next: (modules) => this.allModules.set(modules),
      error: (err) => console.error('Error loading modules:', err)
    });
  }

  loadAllSubModules(): void {
    this.subModuleService.getSubModules().subscribe({
      next: (subModules) => {
        this.allSubModules.set(subModules);
        if (subModules.length > 0 && !this.selectedSubModuleId()) {
          const firstSubModule = subModules[0];
          this.selectedSubModuleId.set(firstSubModule.subModuleId);
          this.loadSubModuleDetails(firstSubModule.subModuleId);
        }
      },
      error: (err) => console.error('Error loading submodules:', err)
    });
  }

  private loadSubModuleDetails(subModuleId: string): void {
    this.subModuleService.getSubModuleById(subModuleId).subscribe({
      next: (subModule) => {
        if (subModule) {
          this.populateForm(subModule);
        }
      },
      error: (err) => console.error('Error loading submodule details:', err)
    });
  }

  private populateForm(subModule: SubModule): void {
    this.subModuleForm.patchValue({
      subModuleId: subModule.subModuleId,
      moduleId: subModule.moduleId,
      subModuleKey: subModule.subModuleKey,
      subModuleName: subModule.subModuleName,
      status: subModule.status === 'Active'
    });
  }

  filteredSidebarSubModules = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const subModules = this.allSubModules();
    if (!term) return subModules;
    return subModules.filter(sm => 
      sm.subModuleName.toLowerCase().includes(term) || 
      sm.subModuleKey.toLowerCase().includes(term) ||
      sm.moduleName?.toLowerCase().includes(term)
    );
  });

  selectSubModule(subModule: SubModule): void {
    this.selectedSubModuleId.set(subModule.subModuleId);
    this.populateForm(subModule);
    this.isInEditMode.set(false);
    this.subModuleForm.disable();
  }

  addNewSubModule(): void {
    this.selectedSubModuleId.set(null);
    this.subModuleForm.reset({ subModuleId: '', moduleId: '', subModuleKey: '', subModuleName: '', status: true });
    this.isInEditMode.set(true);
    this.subModuleForm.enable();
  }

  onSubmit(): void {
    if (this.subModuleForm.valid) {
      const formValue = this.subModuleForm.value;
      const selectedModule = this.allModules().find(m => m.moduleId === formValue.moduleId);
      
      const subModuleData: SubModule = {
        subModuleId: formValue.subModuleId || crypto.randomUUID(),
        moduleId: formValue.moduleId,
        moduleName: selectedModule?.moduleName,
        subModuleKey: formValue.subModuleKey.toUpperCase(),
        subModuleName: formValue.subModuleName,
        status: formValue.status ? 'Active' : 'Inactive',
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedSubModuleId()) {
        this.subModuleService.updateSubModule(subModuleData.subModuleId, subModuleData).subscribe({
          next: () => {
            this.loadAllSubModules();
            this.populateForm(subModuleData);
            this.isInEditMode.set(false);
            this.subModuleForm.disable();
          },
          error: (err) => console.error('Error updating submodule:', err)
        });
      } else {
        this.subModuleService.createSubModule(subModuleData).subscribe({
          next: (newSubModule) => {
            this.loadAllSubModules();
            this.selectedSubModuleId.set(newSubModule.subModuleId);
            this.populateForm(newSubModule);
            this.isInEditMode.set(false);
            this.subModuleForm.disable();
          },
          error: (err) => console.error('Error creating submodule:', err)
        });
      }
    }
  }

  toggleViewMode(mode: 'cards' | 'list'): void {
    this.viewMode.set(mode);
  }

  enableEditMode(): void {
    this.isInEditMode.set(true);
    this.subModuleForm.enable();
  }

  cancelEdit(): void {
    const currentSubModuleId = this.selectedSubModuleId();
    if (currentSubModuleId) {
      this.loadSubModuleDetails(currentSubModuleId);
    }
    this.isInEditMode.set(false);
    this.subModuleForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/submodules']);
  }

  get formTitle(): string {
    if (!this.selectedSubModuleId()) {
      return 'New SubModule';
    }
    const selectedSubModule = this.allSubModules().find(sm => sm.subModuleId === this.selectedSubModuleId());
    return selectedSubModule?.subModuleName || 'SubModule';
  }

  getSubModuleIcon(): string {
    return '🔷';
  }

  getSubModuleIconColor(): string {
    return 'bg-blue-100';
  }

  getSubModuleCardColor(): string {
    return 'bg-blue-50';
  }

  getModuleName(moduleId: string): string {
    const module = this.allModules().find(m => m.moduleId === moduleId);
    return module?.moduleName || 'Unknown Module';
  }
}
