import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Country } from '../models/country.model';
import { CountryService } from '../../../core/services/country.service';

@Component({
  selector: 'app-country-form',
  templateUrl: './country-form.component.html',
  styleUrls: ['./country-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule]
})
export class CountryFormComponent implements OnInit {
  country = input<Country | null>(null);
  mode = input<'add' | 'edit' | 'view'>('add');
  formSubmit = output<Country>();
  cancel = output<void>();

  private fb = new FormBuilder();
  private countryService = inject(CountryService);
  router = inject(Router);
  
  countryForm: FormGroup;
  allCountries = signal<Country[]>([]);
  selectedCountryId = signal<string | null>(null);
  sidebarSearchTerm = '';
  viewMode = signal<'cards' | 'list'>('cards');
  isInEditMode = signal(false);

  activeCountriesCount = computed(() => this.allCountries().filter(c => c.status === 'Active').length);
  inactiveCountriesCount = computed(() => this.allCountries().filter(c => c.status === 'Inactive').length);

  continents = [
    { label: 'Africa', value: 'Africa' },
    { label: 'Antarctica', value: 'Antarctica' },
    { label: 'Asia', value: 'Asia' },
    { label: 'Europe', value: 'Europe' },
    { label: 'North America', value: 'North America' },
    { label: 'Oceania', value: 'Oceania' },
    { label: 'South America', value: 'South America' }
  ];

  constructor() {
    this.countryForm = this.fb.group({
      countryId: [''],
      countryName: ['', [Validators.required, Validators.minLength(2)]],
      countryCodeISO2: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      countryCodeISO3: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      phoneCode: [''],
      continent: [''],
      status: [true]
    });

    effect(() => {
      const currentCountry = this.country();
      if (currentCountry) {
        this.selectedCountryId.set(currentCountry.countryId);
        this.countryForm.patchValue({
          countryId: currentCountry.countryId,
          countryName: currentCountry.countryName,
          countryCodeISO2: currentCountry.countryCodeISO2,
          countryCodeISO3: currentCountry.countryCodeISO3,
          phoneCode: currentCountry.phoneCode || '',
          continent: currentCountry.continent || '',
          status: currentCountry.status === 'Active'
        });
      }
    });

    effect(() => {
      if (!this.isInEditMode() && this.selectedCountryId()) {
        this.countryForm.disable();
      } else if (this.isInEditMode()) {
        this.countryForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllCountries();
  }

  loadAllCountries(): void {
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.allCountries.set(countries);
        if (countries.length > 0 && !this.country()) {
          const firstCountry = countries[0];
          this.selectedCountryId.set(firstCountry.countryId);
          if (!this.country()) {
            this.loadCountryDetails(firstCountry.countryId);
          }
        }
      },
      error: (err) => console.error('Error loading countries:', err)
    });
  }

  private loadCountryDetails(countryId: string): void {
    this.countryService.getCountryById(countryId).subscribe({
      next: (country) => {
        if (country) {
          this.populateForm(country);
        }
      },
      error: (err) => console.error('Error loading country details:', err)
    });
  }

  private populateForm(country: Country): void {
    this.countryForm.patchValue({
      countryId: country.countryId,
      countryName: country.countryName,
      countryCodeISO2: country.countryCodeISO2,
      countryCodeISO3: country.countryCodeISO3,
      phoneCode: country.phoneCode || '',
      continent: country.continent || '',
      status: country.status === 'Active'
    });
  }

  filteredSidebarCountries = computed(() => {
    const term = this.sidebarSearchTerm.toLowerCase();
    const countries = this.allCountries();
    if (!term) return countries;
    return countries.filter(c => 
      c.countryName.toLowerCase().includes(term) || 
      c.countryCodeISO2.toLowerCase().includes(term) ||
      c.countryCodeISO3.toLowerCase().includes(term) ||
      (c.continent?.toLowerCase() || '').includes(term)
    );
  });

  selectCountry(country: Country): void {
    this.selectedCountryId.set(country.countryId);
    this.populateForm(country);
    this.isInEditMode.set(false);
    this.countryForm.disable();
  }

  addNewCountry(): void {
    this.selectedCountryId.set(null);
    this.countryForm.reset({ 
      countryId: '', 
      countryName: '', 
      countryCodeISO2: '', 
      countryCodeISO3: '', 
      phoneCode: '', 
      continent: '', 
      status: true 
    });
    this.isInEditMode.set(true);
    this.countryForm.enable();
  }

  onSubmit(): void {
    if (this.countryForm.valid) {
      const formValue = this.countryForm.value;
      const countryData: Country = {
        countryId: formValue.countryId || crypto.randomUUID(),
        countryName: formValue.countryName,
        countryCodeISO2: formValue.countryCodeISO2.toUpperCase(),
        countryCodeISO3: formValue.countryCodeISO3.toUpperCase(),
        phoneCode: formValue.phoneCode,
        continent: formValue.continent,
        status: formValue.status ? 'Active' : 'Inactive',
        isDeleted: false,
        createdAt: this.country()?.createdAt || new Date(),
        createdBy: this.country()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      
      if (this.selectedCountryId()) {
        this.countryService.updateCountry(countryData.countryId, countryData).subscribe({
          next: () => {
            this.loadAllCountries();
            this.populateForm(countryData);
            this.isInEditMode.set(false);
            this.countryForm.disable();
          },
          error: (err) => console.error('Error updating country:', err)
        });
      } else {
        this.countryService.createCountry(countryData).subscribe({
          next: (newCountry) => {
            this.loadAllCountries();
            this.selectedCountryId.set(newCountry.countryId);
            this.populateForm(newCountry);
            this.isInEditMode.set(false);
            this.countryForm.disable();
          },
          error: (err) => console.error('Error creating country:', err)
        });
      }
      this.formSubmit.emit(countryData);
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
    this.countryForm.enable();
  }

  cancelEdit(): void {
    const currentCountryId = this.selectedCountryId();
    if (currentCountryId) {
      this.loadCountryDetails(currentCountryId);
    }
    this.isInEditMode.set(false);
    this.countryForm.disable();
  }

  backToList(): void {
    this.router.navigate(['/countries']);
  }

  countryName = computed(() => this.country()?.countryName || 'Country');

  get formTitle(): string {
    if (!this.selectedCountryId()) {
      return 'New Country';
    }
    const selectedCountry = this.allCountries().find(c => c.countryId === this.selectedCountryId());
    return selectedCountry?.countryName || 'Country';
  }

  getCountryFlag(countryCodeISO2: string): string {
    // Returns flag emoji based on ISO2 code
    const codePoints = countryCodeISO2
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getCountryCardColor(continent: string): string {
    const colors: Record<string, string> = {
      'Asia': 'bg-orange-50',
      'Europe': 'bg-blue-50',
      'North America': 'bg-green-50',
      'South America': 'bg-yellow-50',
      'Africa': 'bg-purple-50',
      'Oceania': 'bg-cyan-50',
      'Antarctica': 'bg-gray-50'
    };
    return colors[continent] || 'bg-gray-50';
  }

  getCreatedDate(): string | null {
    const selectedCountry = this.allCountries().find(c => c.countryId === this.selectedCountryId());
    return selectedCountry ? new Date().toISOString() : null;
  }
}
