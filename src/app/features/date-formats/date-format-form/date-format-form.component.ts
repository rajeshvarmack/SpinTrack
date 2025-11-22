import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DateFormat } from '../models/date-format.model';
import { DateFormatService } from '../../../core/services/date-format.service';

@Component({
  selector: 'app-date-format-form',
  standalone: true,
  templateUrl: './date-format-form.component.html',
  styleUrls: ['./date-format-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DateFormatFormComponent implements OnInit {
  dateFormat = input<DateFormat | null>(null);
  mode = input<'add' | 'edit' | 'view'>('add');
  formSubmit = output<DateFormat>();
  cancel = output<void>();

  private fb = new FormBuilder();
  private dateFormatService = inject(DateFormatService);
  router = inject(Router);
  
  dateFormatForm: FormGroup;
  allDateFormats = signal<DateFormat[]>([]);
  selectedDateFormatId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeDateFormatsCount = computed(() => this.allDateFormats().filter(d => d.status === 'Active').length);
  inactiveDateFormatsCount = computed(() => this.allDateFormats().filter(d => d.status === 'Inactive').length);

  constructor() {
    this.dateFormatForm = this.fb.group({
      dateFormatId: [''],
      formatString: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(150)]],
      isDefault: [false],
      status: [true]
    });

    effect(() => {
      const currentDateFormat = this.dateFormat();
      if (currentDateFormat) {
        this.selectedDateFormatId.set(currentDateFormat.dateFormatId);
        this.dateFormatForm.patchValue({
          dateFormatId: currentDateFormat.dateFormatId,
          formatString: currentDateFormat.formatString,
          description: currentDateFormat.description || '',
          isDefault: currentDateFormat.isDefault,
          status: currentDateFormat.status === 'Active'
        });
      }
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedDateFormatId()) {
        this.dateFormatForm.disable();
      } else if (this.isInEditMode()) {
        this.dateFormatForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllDateFormats();
  }

  loadAllDateFormats(): void {
    this.dateFormatService.getDateFormats().subscribe({
      next: (dateFormats) => {
        this.allDateFormats.set(dateFormats);
        if (dateFormats.length > 0 && !this.dateFormat()) {
          const firstDateFormat = dateFormats[0];
          this.selectedDateFormatId.set(firstDateFormat.dateFormatId);
          if (!this.dateFormat()) {
            this.loadDateFormatDetails(firstDateFormat.dateFormatId);
          }
        }
      },
      error: (err) => console.error('Error loading date formats:', err)
    });
  }

  private loadDateFormatDetails(dateFormatId: string): void {
    this.dateFormatService.getDateFormatById(dateFormatId).subscribe({
      next: (dateFormat) => {
        if (dateFormat) {
          this.populateForm(dateFormat);
        }
      },
      error: (err) => console.error('Error loading date format details:', err)
    });
  }

  private populateForm(dateFormat: DateFormat): void {
    this.dateFormatForm.patchValue({
      dateFormatId: dateFormat.dateFormatId,
      formatString: dateFormat.formatString,
      description: dateFormat.description || '',
      isDefault: dateFormat.isDefault,
      status: dateFormat.status === 'Active'
    });
  }

  filteredSidebarDateFormats = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const dateFormats = this.allDateFormats();
    if (!term) return dateFormats;
    return dateFormats.filter(d => 
      d.formatString.toLowerCase().includes(term) ||
      (d.description?.toLowerCase() || '').includes(term)
    );
  });

  selectDateFormat(dateFormat: DateFormat): void {
    this.selectedDateFormatId.set(dateFormat.dateFormatId);
    this.populateForm(dateFormat);
    this.isInEditMode.set(false);
    this.dateFormatForm.disable();
  }

  addNewDateFormat(): void {
    this.selectedDateFormatId.set(null);
    this.dateFormatForm.reset({ 
      dateFormatId: '', 
      formatString: '', 
      description: '', 
      isDefault: false,
      status: true 
    });
    this.isInEditMode.set(true);
    this.dateFormatForm.enable();
  }

  onSubmit(): void {
    if (this.dateFormatForm.valid) {
      const formValue = this.dateFormatForm.value;
      const dateFormatData: DateFormat = {
        dateFormatId: formValue.dateFormatId || crypto.randomUUID(),
        formatString: formValue.formatString,
        description: formValue.description,
        isDefault: formValue.isDefault,
        status: formValue.status ? 'Active' : 'Inactive',
        isDeleted: false,
        createdAt: this.dateFormat()?.createdAt || new Date(),
        createdBy: this.dateFormat()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedDateFormatId()) {
        this.dateFormatService.updateDateFormat(dateFormatData.dateFormatId, dateFormatData).subscribe({
          next: () => {
            this.loadAllDateFormats();
            this.populateForm(dateFormatData);
            this.isInEditMode.set(false);
            this.dateFormatForm.disable();
          },
          error: (err) => console.error('Error updating date format:', err)
        });
      } else {
        this.dateFormatService.createDateFormat(dateFormatData).subscribe({
          next: (newDateFormat) => {
            this.loadAllDateFormats();
            this.selectedDateFormatId.set(newDateFormat.dateFormatId);
            this.populateForm(newDateFormat);
            this.isInEditMode.set(false);
            this.dateFormatForm.disable();
          },
          error: (err) => console.error('Error creating date format:', err)
        });
      }
      this.formSubmit.emit(dateFormatData);
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
    this.dateFormatForm.enable();
  }

  cancelEdit(): void {
    const currentDateFormatId = this.selectedDateFormatId();
    if (currentDateFormatId) {
      this.loadDateFormatDetails(currentDateFormatId);
    }
    this.isInEditMode.set(false);
    this.dateFormatForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/dateformats']);
  }

  get formTitle(): string {
    if (!this.selectedDateFormatId()) {
      return 'New Date Format';
    }
    const selectedDateFormat = this.allDateFormats().find(d => d.dateFormatId === this.selectedDateFormatId());
    return selectedDateFormat?.formatString || 'Date Format';
  }

  getDateFormatCardColor(format: string): string {
    // Simple color logic based on format length or content
    if (format.includes('/')) return 'bg-blue-50';
    if (format.includes('-')) return 'bg-green-50';
    if (format.includes(',')) return 'bg-purple-50';
    return 'bg-gray-50';
  }
}
