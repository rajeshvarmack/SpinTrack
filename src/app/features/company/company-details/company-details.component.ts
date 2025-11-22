import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CompanyFormStateService } from '../services/company-form-state.service';
import { CountryService } from '../../../core/services/country.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TimeZoneService } from '../../../core/services/timezone.service';
import { DateFormatService } from '../../../core/services/date-format.service';
import { Country } from '../../countries/models/country.model';
import { Currency } from '../../currencies/models/currency.model';
import { TimeZone } from '../../timezones/models/timezone.model';
import { DateFormat } from '../../date-formats/models/date-format.model';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit {
  private stateService = inject(CompanyFormStateService);
  private countryService = inject(CountryService);
  private currencyService = inject(CurrencyService);
  private timeZoneService = inject(TimeZoneService);
  private dateFormatService = inject(DateFormatService);

  companyForm!: FormGroup;

  // Reference data
  countries: Country[] = [];
  currencies: Currency[] = [];
  timeZones: TimeZone[] = [];
  dateFormats: DateFormat[] = [];

  // Computed signals from state service
  logoPreview = computed(() => this.stateService.logoPreview());

  // Fiscal months dropdown
  fiscalMonths = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  ngOnInit() {
    // Get form from state service
    this.companyForm = this.stateService.getForm() as FormGroup;

    // Load reference data
    this.loadReferenceData();
  }

  loadReferenceData() {
    this.countryService.getCountries().subscribe(data => this.countries = data);
    this.currencyService.getCurrencies().subscribe(data => this.currencies = data);
    this.timeZoneService.getTimeZones().subscribe(data => this.timeZones = data);
    this.dateFormatService.getDateFormats().subscribe(data => this.dateFormats = data);
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.stateService.setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.stateService.setLogoPreview(null);
  }
}


