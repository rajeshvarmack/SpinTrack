import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Currency } from '../models/currency.model';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-currency-form',
  standalone: true,
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule]
})
export class CurrencyFormComponent implements OnInit {
  currency = input<Currency | null>(null);
  mode = input<'add' | 'edit' | 'view'>('add');
  formSubmit = output<Currency>();
  cancel = output<void>();

  private fb = new FormBuilder();
  private currencyService = inject(CurrencyService);
  router = inject(Router);
  
  currencyForm: FormGroup;
  allCurrencies = signal<Currency[]>([]);
  selectedCurrencyId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeCurrenciesCount = computed(() => this.allCurrencies().filter(c => c.status === 'Active').length);
  inactiveCurrenciesCount = computed(() => this.allCurrencies().filter(c => c.status === 'Inactive').length);

  decimalPlacesOptions = [
    { label: '0 (e.g., JPY)', value: 0 },
    { label: '1', value: 1 },
    { label: '2 (Standard)', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
  ];

  constructor() {
    this.currencyForm = this.fb.group({
      currencyId: [''],
      currencyCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      currencySymbol: [''],
      decimalPlaces: [2, [Validators.required, Validators.min(0), Validators.max(10)]],
      isDefault: [false],
      status: [true]
    });

    effect(() => {
      const currentCurrency = this.currency();
      if (currentCurrency) {
        this.selectedCurrencyId.set(currentCurrency.currencyId);
        this.currencyForm.patchValue({
          currencyId: currentCurrency.currencyId,
          currencyCode: currentCurrency.currencyCode,
          currencySymbol: currentCurrency.currencySymbol || '',
          decimalPlaces: currentCurrency.decimalPlaces,
          isDefault: currentCurrency.isDefault,
          status: currentCurrency.status === 'Active'
        });
      }
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedCurrencyId()) {
        this.currencyForm.disable();
      } else if (this.isInEditMode()) {
        this.currencyForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllCurrencies();
  }

  loadAllCurrencies(): void {
    this.currencyService.getCurrencies().subscribe({
      next: (currencies) => {
        this.allCurrencies.set(currencies);
        if (currencies.length > 0 && !this.currency()) {
          const firstCurrency = currencies[0];
          this.selectedCurrencyId.set(firstCurrency.currencyId);
          if (!this.currency()) {
            this.loadCurrencyDetails(firstCurrency.currencyId);
          }
        }
      },
      error: (err) => console.error('Error loading currencies:', err)
    });
  }

  private loadCurrencyDetails(currencyId: string): void {
    this.currencyService.getCurrencyById(currencyId).subscribe({
      next: (currency) => {
        if (currency) {
          this.populateForm(currency);
        }
      },
      error: (err) => console.error('Error loading currency details:', err)
    });
  }

  private populateForm(currency: Currency): void {
    this.currencyForm.patchValue({
      currencyId: currency.currencyId,
      currencyCode: currency.currencyCode,
      currencySymbol: currency.currencySymbol || '',
      decimalPlaces: currency.decimalPlaces,
      isDefault: currency.isDefault,
      status: currency.status === 'Active'
    });
  }

  filteredSidebarCurrencies = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const currencies = this.allCurrencies();
    if (!term) return currencies;
    return currencies.filter(c => 
      c.currencyCode.toLowerCase().includes(term) ||
      (c.currencySymbol?.toLowerCase() || '').includes(term)
    );
  });

  selectCurrency(currency: Currency): void {
    this.selectedCurrencyId.set(currency.currencyId);
    this.populateForm(currency);
    this.isInEditMode.set(false);
    this.currencyForm.disable();
  }

  addNewCurrency(): void {
    this.selectedCurrencyId.set(null);
    this.currencyForm.reset({ 
      currencyId: '', 
      currencyCode: '', 
      currencySymbol: '', 
      decimalPlaces: 2,
      isDefault: false,
      status: true 
    });
    this.isInEditMode.set(true);
    this.currencyForm.enable();
  }

  onSubmit(): void {
    if (this.currencyForm.valid) {
      const formValue = this.currencyForm.value;
      const currencyData: Currency = {
        currencyId: formValue.currencyId || crypto.randomUUID(),
        currencyCode: formValue.currencyCode.toUpperCase(),
        currencySymbol: formValue.currencySymbol,
        decimalPlaces: formValue.decimalPlaces,
        isDefault: formValue.isDefault,
        status: formValue.status ? 'Active' : 'Inactive',
        isDeleted: false,
        createdAt: this.currency()?.createdAt || new Date(),
        createdBy: this.currency()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedCurrencyId()) {
        this.currencyService.updateCurrency(currencyData.currencyId, currencyData).subscribe({
          next: () => {
            this.loadAllCurrencies();
            this.populateForm(currencyData);
            this.isInEditMode.set(false);
            this.currencyForm.disable();
          },
          error: (err) => console.error('Error updating currency:', err)
        });
      } else {
        this.currencyService.createCurrency(currencyData).subscribe({
          next: (newCurrency) => {
            this.loadAllCurrencies();
            this.selectedCurrencyId.set(newCurrency.currencyId);
            this.populateForm(newCurrency);
            this.isInEditMode.set(false);
            this.currencyForm.disable();
          },
          error: (err) => console.error('Error creating currency:', err)
        });
      }
      this.formSubmit.emit(currencyData);
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
    this.currencyForm.enable();
  }

  cancelEdit(): void {
    const currentCurrencyId = this.selectedCurrencyId();
    if (currentCurrencyId) {
      this.loadCurrencyDetails(currentCurrencyId);
    }
    this.isInEditMode.set(false);
    this.currencyForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/currencies']);
  }

  get formTitle(): string {
    if (!this.selectedCurrencyId()) {
      return 'New Currency';
    }
    const selectedCurrency = this.allCurrencies().find(c => c.currencyId === this.selectedCurrencyId());
    return selectedCurrency?.currencyCode || 'Currency';
  }

  getCurrencyCardColor(code: string): string {
    const colors: Record<string, string> = {
      'USD': 'bg-green-50',
      'EUR': 'bg-blue-50',
      'GBP': 'bg-purple-50',
      'JPY': 'bg-red-50',
      'AED': 'bg-cyan-50',
      'INR': 'bg-orange-50'
    };
    return colors[code] || 'bg-gray-50';
  }
}
