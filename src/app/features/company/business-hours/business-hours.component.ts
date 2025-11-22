import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatePicker } from 'primeng/datepicker';
import { CompanyFormStateService } from '../services/company-form-state.service';
import { CompanyService } from '../services/company.service';
import { BusinessHours } from '../models/company.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-business-hours',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, DatePicker],
  templateUrl: './business-hours.component.html',
  styleUrl: './business-hours.component.css',
})
export class BusinessHoursComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  stateService = inject(CompanyFormStateService);
  private companyService = inject(CompanyService);
  private destroy$ = new Subject<void>();

  businessHoursForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  formUpdateTrigger = signal(0); // Signal to trigger computed updates

  readonly daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Computed stats
  totalShiftsCount = computed(() => {
    this.formUpdateTrigger(); // Track this signal
    if (!this.businessHoursForm) return 0;
    return this.getShiftsArray().controls.filter(c => c.get('isWorkingShift')?.value).length;
  });

  totalWeeklyHours = computed(() => {
    this.formUpdateTrigger(); // Track this signal
    if (!this.businessHoursForm) return 0;
    let totalMinutes = 0;
    this.getShiftsArray().controls.forEach(control => {
      if (control.get('isWorkingShift')?.value) {
        const start = control.get('startTime')?.value;
        const end = control.get('endTime')?.value;
        if (start && end) {
          const startTime = start instanceof Date ? this.dateToTimeString(start) : start;
          const endTime = end instanceof Date ? this.dateToTimeString(end) : end;
          totalMinutes += this.calculateMinutesDifference(startTime, endTime);
        }
      }
    });
    return (totalMinutes / 60).toFixed(1);
  });

  activeDaysCount = computed(() => {
    this.formUpdateTrigger(); // Track this signal
    if (!this.businessHoursForm) return 0;
    let count = 0;
    this.getShiftsArray().controls.forEach(control => {
      if (control.get('isWorkingShift')?.value) {
        count++;
      }
    });
    return count;
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadBusinessHours();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.businessHoursForm = this.fb.group({
      shifts: this.fb.array([])
    });

    // Initialize with all 7 days
    this.daysOfWeek.forEach(day => {
      this.getShiftsArray().push(this.createShiftFormGroup(undefined, day));
    });

    this.businessHoursForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.stateService.setDirty(true);
        this.formUpdateTrigger.update(v => v + 1); // Trigger computed updates
      });
  }

  private createShiftFormGroup(shift?: BusinessHours, defaultDay?: string): FormGroup {
    // Convert time strings to Date objects for PrimeNG DatePicker
    const startTimeDate = shift?.startTime ? this.timeStringToDate(shift.startTime) : this.timeStringToDate('09:00');
    const endTimeDate = shift?.endTime ? this.timeStringToDate(shift.endTime) : this.timeStringToDate('17:00');

    return this.fb.group({
      businessHoursId: [shift?.businessHoursId || crypto.randomUUID()],
      companyId: [shift?.companyId || this.stateService.company()?.companyId || ''],
      dayOfWeek: [shift?.dayOfWeek || defaultDay || 'Monday', Validators.required],
      shiftName: [shift?.shiftName || 'Regular Hours', Validators.required],
      startTime: [startTimeDate, Validators.required],
      endTime: [endTimeDate, Validators.required],
      isWorkingShift: [shift?.isWorkingShift ?? false],
      isOvertimeEligible: [shift?.isOvertimeEligible ?? false],
      remarks: [shift?.remarks || ''],
      status: [shift?.status || 'Active'],
      isDeleted: [false],
      createdAt: [shift?.createdAt || new Date()],
      createdBy: [shift?.createdBy || 'system'],
      updatedAt: [shift?.updatedAt],
      updatedBy: [shift?.updatedBy]
    }, { validators: this.timeRangeValidator.bind(this) });
  }

  private timeRangeValidator(group: AbstractControl): { [key: string]: any } | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    
    if (start && end) {
      // Handle both Date objects (from DatePicker) and string values
      const startTime = start instanceof Date ? this.dateToTimeString(start) : start;
      const endTime = end instanceof Date ? this.dateToTimeString(end) : end;
      
      if (startTime >= endTime) {
        return { timeRangeInvalid: true };
      }
    }
    return null;
  }

  private loadBusinessHours(): void {
    const company = this.stateService.company();
    if (!company?.companyId) return;

    this.isLoading.set(true);

    this.companyService.getBusinessHours(company.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hours) => {
          this.getShiftsArray().clear();
          
          // Create a map of loaded hours by day
          const hoursMap = new Map<string, BusinessHours>();
          hours.forEach(h => hoursMap.set(h.dayOfWeek, h));
          
          // Initialize all 7 days with loaded data or defaults
          this.daysOfWeek.forEach(day => {
            const existingHours = hoursMap.get(day);
            this.getShiftsArray().push(this.createShiftFormGroup(existingHours, day));
          });
          
          this.isLoading.set(false);
          this.stateService.setDirty(false);
        },
        error: (error) => {
          console.error('Error loading business hours:', error);
          this.isLoading.set(false);
        }
      });
  }

  getShiftsArray(): FormArray {
    return this.businessHoursForm.get('shifts') as FormArray;
  }

  getShiftFormGroup(index: number): FormGroup {
    return this.getShiftsArray().at(index) as FormGroup;
  }

  saveBusinessHours(): void {
    if (!this.businessHoursForm.valid) return;

    this.isSaving.set(true);
    
    // Convert Date objects back to time strings for API and filter only working days
    const shifts = this.businessHoursForm.value.shifts
      .filter((shift: any) => shift.isWorkingShift) // Only save working days
      .map((shift: any) => ({
        ...shift,
        startTime: shift.startTime instanceof Date ? this.dateToTimeString(shift.startTime) : shift.startTime,
        endTime: shift.endTime instanceof Date ? this.dateToTimeString(shift.endTime) : shift.endTime
      })) as BusinessHours[];

    this.companyService.saveBusinessHours(shifts)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.stateService.setDirty(false);
          console.log('Business hours saved successfully');
        },
        error: (error) => {
          console.error('Error saving business hours:', error);
          this.isSaving.set(false);
        }
      });
  }

  // Helper for template
  calculateDuration(start: string | Date, end: string | Date): string {
    if (!start || !end) return '0h';
    
    // Convert to time strings if they are Date objects
    const startTime = start instanceof Date ? this.dateToTimeString(start) : start;
    const endTime = end instanceof Date ? this.dateToTimeString(end) : end;
    
    const minutes = this.calculateMinutesDifference(startTime, endTime);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  private calculateMinutesDifference(start: string, end: string): number {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(0, endMinutes - startMinutes);
  }

  // Helper methods for template
  getShiftsForDay(day: string): FormGroup[] {
    return this.getShiftsArray().controls
      .filter(control => control.get('dayOfWeek')?.value === day)
      .map(control => control as FormGroup);
  }

  getTotalHoursForDay(day: string): string {
    let totalMinutes = 0;
    this.getShiftsForDay(day).forEach(shift => {
      const start = shift.get('startTime')?.value;
      const end = shift.get('endTime')?.value;
      if (start && end) {
        const startTime = start instanceof Date ? this.dateToTimeString(start) : start;
        const endTime = end instanceof Date ? this.dateToTimeString(end) : end;
        totalMinutes += this.calculateMinutesDifference(startTime, endTime);
      }
    });
    if (totalMinutes === 0) return '0h';
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // Helper methods for Date <-> Time string conversion
  private timeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private dateToTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
