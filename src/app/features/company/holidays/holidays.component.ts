import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { CompanyFormStateService } from '../services/company-form-state.service';
import { CompanyService } from '../services/company.service';
import { CountryService } from '../../../core/services/country.service';
import { BusinessHoliday } from '../models/company.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePicker, NgSelectModule],
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.css',
})
export class HolidaysComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private stateService = inject(CompanyFormStateService);
  private companyService = inject(CompanyService);
  private countryService = inject(CountryService);
  private destroy$ = new Subject<void>();

  companyId = signal('');

  holidays = signal<BusinessHoliday[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  showAddDialog = signal(false);
  editingHoliday = signal<BusinessHoliday | null>(null);
  
  countries = signal<any[]>([]);
  
  holidayForm!: FormGroup;

  readonly holidayTypes = ['Public', 'Company', 'Optional'];
  
  // Computed stats
  totalHolidays = computed(() => this.holidays().length);
  publicHolidays = computed(() => this.holidays().filter(h => h.holidayType === 'Public').length);
  companyHolidays = computed(() => this.holidays().filter(h => h.holidayType === 'Company').length);
  optionalHolidays = computed(() => this.holidays().filter(h => h.holidayType === 'Optional').length);
  
  // Upcoming holidays (future dates)
  upcomingHolidays = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.holidays().filter(h => {
      const holidayDate = new Date(h.holidayDate);
      return holidayDate >= today;
    }).sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime());
  });

  ngOnInit(): void {
    // Get company ID from route
    this.companyId.set(this.route.parent?.snapshot.paramMap.get('id') || '');
    
    this.initializeForm();
    this.loadCountries();
    this.loadHolidays();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.holidayForm = this.fb.group({
      businessHolidayId: [''],
      companyId: [this.companyId()],
      holidayDate: [null, Validators.required],
      holidayName: ['', [Validators.required, Validators.maxLength(150)]],
      holidayType: ['Public', Validators.required],
      countryId: [null],
      isFullDay: [true],
      startTime: [null],
      endTime: [null],
      status: ['Active'],
      isDeleted: [false],
      createdAt: [new Date()],
      createdBy: ['system']
    });

    // Watch isFullDay to enable/disable time fields
    this.holidayForm.get('isFullDay')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isFullDay => {
        const startTimeControl = this.holidayForm.get('startTime');
        const endTimeControl = this.holidayForm.get('endTime');
        
        if (isFullDay) {
          // Full day - clear time fields and remove validators
          startTimeControl?.setValue(null);
          endTimeControl?.setValue(null);
          startTimeControl?.clearValidators();
          endTimeControl?.clearValidators();
        } else {
          // Partial day - add required validators for time fields
          startTimeControl?.setValidators([Validators.required]);
          endTimeControl?.setValidators([Validators.required]);
        }
        
        // Update validity after changing validators
        startTimeControl?.updateValueAndValidity();
        endTimeControl?.updateValueAndValidity();
      });
    
    // Initialize the time field validators based on the default isFullDay value
    // Since default is true, we should clear validators for time fields
    const startTimeControl = this.holidayForm.get('startTime');
    const endTimeControl = this.holidayForm.get('endTime');
    startTimeControl?.clearValidators();
    endTimeControl?.clearValidators();
    startTimeControl?.updateValueAndValidity();
    endTimeControl?.updateValueAndValidity();
  }

  private loadCountries(): void {
    this.countryService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);
        },
        error: (error) => console.error('Error loading countries:', error)
      });
  }

  private loadHolidays(): void {
    if (!this.companyId()) {
      console.warn('No company ID found, cannot load holidays');
      return;
    }

    this.isLoading.set(true);

    this.companyService.getBusinessHolidays(this.companyId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (holidays) => {
          this.holidays.set(holidays);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading holidays:', error);
          this.isLoading.set(false);
        }
      });
  }

  openAddDialog(): void {
    this.editingHoliday.set(null);
    this.holidayForm.reset({
      businessHolidayId: crypto.randomUUID(),
      companyId: this.companyId(),
      holidayType: 'Public',
      isFullDay: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    });
    this.showAddDialog.set(true);
  }

  toggleAddDialog(): void {
    if (this.showAddDialog()) {
      this.closeDialog();
    } else {
      this.openAddDialog();
    }
  }

  openEditDialog(holiday: BusinessHoliday): void {
    this.editingHoliday.set(holiday);
    
    // Convert date string to Date object for DatePicker
    const holidayDate = new Date(holiday.holidayDate);
    
    // Convert time strings to Date objects if partial day
    let startTime = null;
    let endTime = null;
    if (!holiday.isFullDay && holiday.startTime && holiday.endTime) {
      startTime = this.timeStringToDate(holiday.startTime);
      endTime = this.timeStringToDate(holiday.endTime);
    }
    
    this.holidayForm.patchValue({
      ...holiday,
      holidayDate: holidayDate,
      startTime: startTime,
      endTime: endTime
    });
    this.showAddDialog.set(true);
  }

  closeDialog(): void {
    this.showAddDialog.set(false);
    this.editingHoliday.set(null);
    // Reset form with default values to ensure isFullDay is true
    this.holidayForm.reset({
      businessHolidayId: '',
      companyId: this.companyId(),
      holidayDate: null,
      holidayName: '',
      holidayType: 'Public',
      countryId: null,
      isFullDay: true,  // This is critical - must be true by default
      startTime: null,
      endTime: null,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    });
  }

  saveHoliday(): void {
    if (!this.holidayForm.valid) return;

    this.isSaving.set(true);
    
    const formValue = this.holidayForm.value;
    
    // Convert Date objects to proper formats
    const holiday: BusinessHoliday = {
      ...formValue,
      holidayDate: formValue.holidayDate instanceof Date 
        ? formValue.holidayDate.toISOString().split('T')[0] 
        : formValue.holidayDate,
      startTime: formValue.startTime instanceof Date 
        ? this.dateToTimeString(formValue.startTime) 
        : formValue.startTime,
      endTime: formValue.endTime instanceof Date 
        ? this.dateToTimeString(formValue.endTime) 
        : formValue.endTime,
      updatedAt: new Date(),
      updatedBy: 'system'
    };

    this.companyService.saveBusinessHoliday(holiday)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.stateService.setDirty(false);
          // Reload holidays first, then close dialog after data is loaded
          // Pass the companyId from the saved holiday
          this.loadHolidaysAndCloseDialog(holiday.companyId);
        },
        error: (error) => {
          console.error('Error saving holiday:', error);
          this.isSaving.set(false);
        }
      });
  }

  private loadHolidaysAndCloseDialog(companyId: string): void {
    if (!companyId) {
      console.warn('No company ID provided, cannot load holidays');
      return;
    }

    this.isLoading.set(true);

    this.companyService.getBusinessHolidays(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (holidays) => {
          this.holidays.set(holidays);
          this.isLoading.set(false);
          // Close dialog after holidays are loaded
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error loading holidays:', error);
          this.isLoading.set(false);
        }
      });
  }

  deleteHoliday(holidayId: string): void {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    this.companyService.deleteBusinessHoliday(holidayId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadHolidays();
          this.stateService.setDirty(false);
        },
        error: (error) => {
          console.error('Error deleting holiday:', error);
        }
      });
  }

  getCountryName(countryId?: string): string {
    if (!countryId) return 'All Countries';
    const country = this.countries().find(c => c.countryId === countryId);
    return country?.countryName || 'Unknown';
  }

  getMonthName(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short' });
  }

  getDay(date: Date | string): number {
    return new Date(date).getDate();
  }

  getDayOfWeek(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  }

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
