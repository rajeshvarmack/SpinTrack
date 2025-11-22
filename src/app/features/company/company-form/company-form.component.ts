import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CompanyService } from '../services/company.service';
import { CompanyFormStateService } from '../services/company-form-state.service';
import { CountryService } from '../../../core/services/country.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TimeZoneService } from '../../../core/services/timezone.service';
import { DateFormatService } from '../../../core/services/date-format.service';

import { Company } from '../models/company.model';
import { Country } from '../../countries/models/country.model';
import { Currency } from '../../currencies/models/currency.model';
import { TimeZone } from '../../timezones/models/timezone.model';
import { DateFormat } from '../../date-formats/models/date-format.model';

interface Tab {
  id: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterOutlet],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private countryService = inject(CountryService);
  private currencyService = inject(CurrencyService);
  private timeZoneService = inject(TimeZoneService);
  private dateFormatService = inject(DateFormatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // Inject state service
  stateService = inject(CompanyFormStateService);

  companyForm: FormGroup;
  isEditMode = signal(false);
  companyId = signal<string | null>(null);

  // Reference Data Signals
  countries = signal<Country[]>([]);
  currencies = signal<Currency[]>([]);
  timeZones = signal<TimeZone[]>([]);
  dateFormats = signal<DateFormat[]>([]);

  // Tab configuration
  tabs: Tab[] = [
    { id: 'company_info', label: 'Company Info', route: 'company_info' },
    { id: 'business_days', label: 'Business Days', route: 'business_days' },
    { id: 'business_hours', label: 'Business Hours', route: 'business_hours' },
    { id: 'holidays', label: 'Holidays', route: 'holidays' }
  ];

  activeTab = signal<string>('company_info');

  // Fiscal months dropdown (shared via state service)
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

  constructor() {
    // Initialize form
    this.companyForm = this.fb.group({
      // General Info
      companyName: ['', [Validators.required]],
      companyCode: ['', [Validators.required]],
      website: [''],
      address: [''],
      logoUrl: [''],
      
      // Regional Settings
      countryId: [null, [Validators.required]],
      currencyId: [null, [Validators.required]],
      timeZoneId: [null, [Validators.required]],
      dateFormatId: [null],
      fiscalYearStartMonth: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      
      status: [true]
    });
  }

  ngOnInit() {
    this.loadReferenceData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.companyId.set(id);
      this.stateService.setLoading(true);
      this.loadCompanyData(id);
    }

    // Register form with state service
    this.stateService.setForm(this.companyForm);

    // Update active tab based on current route
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url.split('/').pop();
      const matchingTab = this.tabs.find(tab => tab.route === currentRoute);
      if (matchingTab) {
        this.activeTab.set(matchingTab.id);
      }
    });
  }

  loadReferenceData() {
    this.countryService.getCountries().subscribe(data => this.countries.set(data));
    this.currencyService.getCurrencies().subscribe(data => this.currencies.set(data));
    this.timeZoneService.getTimeZones().subscribe(data => this.timeZones.set(data));
    this.dateFormatService.getDateFormats().subscribe(data => this.dateFormats.set(data));
  }

  loadCompanyData(id: string) {
    this.companyService.getCompanyById(id).subscribe(company => {
      if (company) {
        this.companyForm.patchValue({
          companyName: company.companyName,
          companyCode: company.companyCode,
          website: company.website,
          address: company.address,
          logoUrl: company.logoUrl,
          countryId: company.countryId,
          currencyId: company.currencyId,
          timeZoneId: company.timeZoneId,
          dateFormatId: company.dateFormatId,
          fiscalYearStartMonth: company.fiscalYearStartMonth,
          status: company.status === 'Active'
        });
        
        // Update state service
        this.stateService.setCompany(company);
        
        // Set logo preview if exists
        if (company.logoUrl) {
          this.stateService.setLogoPreview(company.logoUrl);
        }
      }
      this.stateService.setLoading(false);
    });
  }

  navigateToTab(tab: Tab) {
    this.activeTab.set(tab.id);
    
    // Build the route path
    const basePath = this.isEditMode() 
      ? `/companies/${this.companyId()}/edit`
      : '/companies/add';
    
    this.router.navigate([basePath, tab.route]);
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab() === tabId;
  }

  onSubmit() {
    if (this.companyForm.valid) {
      this.stateService.setSaving(true);
      const formValue = this.companyForm.value;
      const companyData: Company = {
        companyId: this.companyId() || crypto.randomUUID(),
        companyName: formValue.companyName,
        companyCode: formValue.companyCode,
        countryId: formValue.countryId,
        currencyId: formValue.currencyId,
        timeZoneId: formValue.timeZoneId,
        dateFormatId: formValue.dateFormatId,
        website: formValue.website,
        address: formValue.address,
        logoUrl: formValue.logoUrl,
        fiscalYearStartMonth: formValue.fiscalYearStartMonth,
        status: formValue.status ? 'Active' : 'Inactive',
        createdAt: new Date(),
        createdBy: 'system'
      };

      if (this.isEditMode()) {
        this.companyService.updateCompany(companyData.companyId, companyData).subscribe(() => {
          this.stateService.setSaving(false);
          this.stateService.reset();
          this.router.navigate(['/companies']);
        });
      } else {
        this.companyService.createCompany(companyData).subscribe(() => {
          this.stateService.setSaving(false);
          this.stateService.reset();
          this.router.navigate(['/companies']);
        });
      }
    }
  }

  onCancel() {
    this.stateService.reset();
    this.router.navigate(['/companies']);
  }

  canDeactivate(): boolean {
    return this.stateService.canDeactivate();
  }
}
