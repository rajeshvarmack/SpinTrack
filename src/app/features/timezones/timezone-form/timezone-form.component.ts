import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TimeZone } from '../models/timezone.model';
import { TimeZoneService } from '../../../core/services/timezone.service';

@Component({
  selector: 'app-timezone-form',
  standalone: true,
  templateUrl: './timezone-form.component.html',
  styleUrls: ['./timezone-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule]
})
export class TimeZoneFormComponent implements OnInit {
  timeZone = input<TimeZone | null>(null);
  mode = input<'add' | 'edit' | 'view'>('add');
  formSubmit = output<TimeZone>();
  cancel = output<void>();

  private fb = new FormBuilder();
  private timeZoneService = inject(TimeZoneService);
  router = inject(Router);
  
  timeZoneForm: FormGroup;
  allTimeZones = signal<TimeZone[]>([]);
  selectedTimeZoneId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeTimeZonesCount = computed(() => this.allTimeZones().filter(tz => tz.status === 'Active').length);
  inactiveTimeZonesCount = computed(() => this.allTimeZones().filter(tz => tz.status === 'Inactive').length);

  constructor() {
    this.timeZoneForm = this.fb.group({
      timeZoneId: [''],
      timeZoneName: ['', [Validators.required, Validators.minLength(3)]],
      gmtOffset: [''],
      supportsDST: [false],
      status: [true]
    });

    effect(() => {
      const currentTimeZone = this.timeZone();
      if (currentTimeZone) {
        this.selectedTimeZoneId.set(currentTimeZone.timeZoneId);
        this.timeZoneForm.patchValue({
          timeZoneId: currentTimeZone.timeZoneId,
          timeZoneName: currentTimeZone.timeZoneName,
          gmtOffset: currentTimeZone.gmtOffset || '',
          supportsDST: currentTimeZone.supportsDST,
          status: currentTimeZone.status === 'Active'
        });
      }
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedTimeZoneId()) {
        this.timeZoneForm.disable();
      } else if (this.isInEditMode()) {
        this.timeZoneForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllTimeZones();
  }

  loadAllTimeZones(): void {
    this.timeZoneService.getTimeZones().subscribe({
      next: (timeZones) => {
        this.allTimeZones.set(timeZones);
        if (timeZones.length > 0 && !this.timeZone()) {
          const firstTimeZone = timeZones[0];
          this.selectedTimeZoneId.set(firstTimeZone.timeZoneId);
          if (!this.timeZone()) {
            this.loadTimeZoneDetails(firstTimeZone.timeZoneId);
          }
        }
      },
      error: (err) => console.error('Error loading timezones:', err)
    });
  }

  private loadTimeZoneDetails(timeZoneId: string): void {
    this.timeZoneService.getTimeZoneById(timeZoneId).subscribe({
      next: (timeZone) => {
        if (timeZone) {
          this.populateForm(timeZone);
        }
      },
      error: (err) => console.error('Error loading timezone details:', err)
    });
  }

  private populateForm(timeZone: TimeZone): void {
    this.timeZoneForm.patchValue({
      timeZoneId: timeZone.timeZoneId,
      timeZoneName: timeZone.timeZoneName,
      gmtOffset: timeZone.gmtOffset || '',
      supportsDST: timeZone.supportsDST,
      status: timeZone.status === 'Active'
    });
  }

  filteredSidebarTimeZones = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const timeZones = this.allTimeZones();
    if (!term) return timeZones;
    return timeZones.filter(tz => 
      tz.timeZoneName.toLowerCase().includes(term) ||
      (tz.gmtOffset?.toLowerCase() || '').includes(term)
    );
  });

  selectTimeZone(timeZone: TimeZone): void {
    this.selectedTimeZoneId.set(timeZone.timeZoneId);
    this.populateForm(timeZone);
    this.isInEditMode.set(false);
    this.timeZoneForm.disable();
  }

  addNewTimeZone(): void {
    this.selectedTimeZoneId.set(null);
    this.timeZoneForm.reset({ 
      timeZoneId: '', 
      timeZoneName: '', 
      gmtOffset: '',
      supportsDST: false,
      status: true 
    });
    this.isInEditMode.set(true);
    this.timeZoneForm.enable();
  }

  onSubmit(): void {
    if (this.timeZoneForm.valid) {
      const formValue = this.timeZoneForm.value;
      const timeZoneData: TimeZone = {
        timeZoneId: formValue.timeZoneId || crypto.randomUUID(),
        timeZoneName: formValue.timeZoneName,
        gmtOffset: formValue.gmtOffset,
        supportsDST: formValue.supportsDST,
        status: formValue.status ? 'Active' : 'Inactive',
        isDeleted: false,
        createdAt: this.timeZone()?.createdAt || new Date(),
        createdBy: this.timeZone()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedTimeZoneId()) {
        this.timeZoneService.updateTimeZone(timeZoneData.timeZoneId, timeZoneData).subscribe({
          next: () => {
            this.loadAllTimeZones();
            this.populateForm(timeZoneData);
            this.isInEditMode.set(false);
            this.timeZoneForm.disable();
          },
          error: (err) => console.error('Error updating timezone:', err)
        });
      } else {
        this.timeZoneService.createTimeZone(timeZoneData).subscribe({
          next: (newTimeZone) => {
            this.loadAllTimeZones();
            this.selectedTimeZoneId.set(newTimeZone.timeZoneId);
            this.populateForm(newTimeZone);
            this.isInEditMode.set(false);
            this.timeZoneForm.disable();
          },
          error: (err) => console.error('Error creating timezone:', err)
        });
      }
      this.formSubmit.emit(timeZoneData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  toggleViewMode(mode: 'cards' | 'list'): void {
    this.viewMode.set(mode);
  }

  enableEditMode(): void {
    this.isInEditMode.set(true);
    this.timeZoneForm.enable();
  }

  cancelEdit(): void {
    const currentTimeZoneId = this.selectedTimeZoneId();
    if (currentTimeZoneId) {
      this.loadTimeZoneDetails(currentTimeZoneId);
    }
    this.isInEditMode.set(false);
    this.timeZoneForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/timezones']);
  }

  get formTitle(): string {
    if (!this.selectedTimeZoneId()) {
      return 'New TimeZone';
    }
    const selectedTimeZone = this.allTimeZones().find(tz => tz.timeZoneId === this.selectedTimeZoneId());
    return selectedTimeZone?.timeZoneName || 'TimeZone';
  }

  getTimeZoneRegion(name: string): string {
    return name.split('/')[0] || 'Other';
  }

  getTimeZoneCardColor(name: string): string {
    const region = this.getTimeZoneRegion(name);
    const colors: Record<string, string> = {
      'Asia': 'bg-orange-50',
      'Europe': 'bg-blue-50',
      'America': 'bg-green-50',
      'Pacific': 'bg-cyan-50',
      'Africa': 'bg-purple-50',
      'Atlantic': 'bg-indigo-50',
      'Indian': 'bg-pink-50'
    };
    return colors[region] || 'bg-gray-50';
  }
}
