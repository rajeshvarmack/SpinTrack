import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyFormStateService } from '../services/company-form-state.service';
import { CompanyService } from '../services/company.service';
import { BusinessDay } from '../models/company.model';
import { Subject, takeUntil } from 'rxjs';

interface DayConfig {
  name: string;
  shortName: string;
  isWeekend: boolean;
  color: string;
}

@Component({
  selector: 'app-business-days',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-days.component.html',
  styleUrl: './business-days.component.css',
})
export class BusinessDaysComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  stateService = inject(CompanyFormStateService);
  private companyService = inject(CompanyService);
  private destroy$ = new Subject<void>();

  businessDaysForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);

  // Day configuration with colors
  readonly daysConfig: DayConfig[] = [
    { name: 'Monday', shortName: 'MON', isWeekend: false, color: '#3b82f6' },
    { name: 'Tuesday', shortName: 'TUE', isWeekend: false, color: '#3b82f6' },
    { name: 'Wednesday', shortName: 'WED', isWeekend: false, color: '#3b82f6' },
    { name: 'Thursday', shortName: 'THU', isWeekend: false, color: '#3b82f6' },
    { name: 'Friday', shortName: 'FRI', isWeekend: false, color: '#3b82f6' },
    { name: 'Saturday', shortName: 'SAT', isWeekend: true, color: '#f59e0b' },
    { name: 'Sunday', shortName: 'SUN', isWeekend: true, color: '#f59e0b' }
  ];

  // Count working/non-working days
  get workingDaysCount(): number {
    if (!this.businessDaysForm) return 0;
    const days = this.businessDaysForm.value.days as any[];
    return days?.filter(d => d.isWorkingDay).length || 0;
  }

  get nonWorkingDaysCount(): number {
    return 7 - this.workingDaysCount;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadBusinessDays();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.businessDaysForm = this.fb.group({
      days: this.fb.array([])
    });

    // Initialize with default days
    this.daysConfig.forEach(dayConfig => {
      this.getDaysArray().push(this.createDayFormGroup(dayConfig));
    });

    // Mark form as dirty when changes occur
    this.businessDaysForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.stateService.setDirty(true);
      });
  }

  private createDayFormGroup(dayConfig: DayConfig, existingDay?: BusinessDay): FormGroup {
    return this.fb.group({
      businessDayId: [existingDay?.businessDayId || crypto.randomUUID()],
      companyId: [existingDay?.companyId || this.stateService.company()?.companyId || ''],
      dayOfWeek: [dayConfig.name, Validators.required],
      isWorkingDay: [existingDay?.isWorkingDay ?? !dayConfig.isWeekend],
      isWeekend: [dayConfig.isWeekend],
      remarks: [existingDay?.remarks || ''],
      status: [existingDay?.status || 'Active'],
      isDeleted: [false],
      createdAt: [existingDay?.createdAt || new Date()],
      createdBy: [existingDay?.createdBy || 'system'],
      updatedAt: [existingDay?.updatedAt],
      updatedBy: [existingDay?.updatedBy]
    });
  }

  private loadBusinessDays(): void {
    const company = this.stateService.company();
    if (!company?.companyId) return;

    this.isLoading.set(true);
    
    this.companyService.getBusinessDays(company.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (businessDays) => {
          if (businessDays.length > 0) {
            // Clear existing and populate with loaded data
            this.getDaysArray().clear();
            this.daysConfig.forEach((dayConfig, index) => {
              const existingDay = businessDays.find(bd => bd.dayOfWeek === dayConfig.name);
              this.getDaysArray().push(this.createDayFormGroup(dayConfig, existingDay));
            });
          }
          this.isLoading.set(false);
          this.stateService.setDirty(false);
        },
        error: (error) => {
          console.error('Error loading business days:', error);
          this.isLoading.set(false);
        }
      });
  }

  getDaysArray(): FormArray {
    return this.businessDaysForm.get('days') as FormArray;
  }

  getDayFormGroup(index: number): FormGroup {
    return this.getDaysArray().at(index) as FormGroup;
  }

  getDayConfig(index: number): DayConfig {
    return this.daysConfig[index];
  }

  getWorkingDayValue(control: any): boolean {
    if (control && typeof control.get === 'function') {
      return control.get('isWorkingDay')?.value || false;
    }
    return false;
  }

  toggleWorkingDay(index: number): void {
    const dayGroup = this.getDayFormGroup(index);
    const currentValue = dayGroup.get('isWorkingDay')?.value;
    dayGroup.patchValue({ isWorkingDay: !currentValue });
  }

  // Quick action methods
  setStandardWeek(): void {
    this.getDaysArray().controls.forEach((control, index) => {
      const dayConfig = this.daysConfig[index];
      control.patchValue({
        isWorkingDay: !dayConfig.isWeekend,
        remarks: dayConfig.isWeekend ? 'Weekend' : ''
      });
    });
  }

  setSixDayWeek(): void {
    this.getDaysArray().controls.forEach((control, index) => {
      const dayConfig = this.daysConfig[index];
      const isWorking = dayConfig.name !== 'Sunday';
      control.patchValue({
        isWorkingDay: isWorking,
        remarks: dayConfig.name === 'Sunday' ? 'Weekend' : ''
      });
    });
  }

  setAllWorking(): void {
    this.getDaysArray().controls.forEach(control => {
      control.patchValue({ isWorkingDay: true, remarks: '' });
    });
  }

  saveBusinessDays(): void {
    if (!this.businessDaysForm.valid) return;

    this.isSaving.set(true);
    const businessDays = this.businessDaysForm.value.days as BusinessDay[];

    this.companyService.saveBusinessDays(businessDays)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.stateService.setDirty(false);
          console.log('Business days saved successfully');
        },
        error: (error) => {
          console.error('Error saving business days:', error);
          this.isSaving.set(false);
        }
      });
  }

  getStatusClass(isWorkingDay: boolean): string {
    return isWorkingDay ? 'status-working' : 'status-non-working';
  }

  getStatusText(isWorkingDay: boolean): string {
    return isWorkingDay ? 'Working' : 'Non-Working';
  }
}
