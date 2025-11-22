import { Injectable, signal, computed } from '@angular/core';
import { Company, BusinessDay, BusinessHours, BusinessHoliday } from '../models/company.model';

interface CompanyViewState {
  company: Company | null;
  businessDays: BusinessDay[];
  businessHours: BusinessHours[];
  holidays: BusinessHoliday[];
  isLoading: boolean;
}

interface ReferenceData {
  countryName: string;
  currencyCode: string;
  timeZoneName: string;
  dateFormatString: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyViewStateService {
  // State signals
  private _state = signal<CompanyViewState>({
    company: null,
    businessDays: [],
    businessHours: [],
    holidays: [],
    isLoading: false
  });

  private _referenceData = signal<ReferenceData>({
    countryName: 'Loading...',
    currencyCode: 'Loading...',
    timeZoneName: 'Loading...',
    dateFormatString: 'Loading...'
  });

  // Public computed signals
  company = computed(() => this._state().company);
  businessDays = computed(() => this._state().businessDays);
  businessHours = computed(() => this._state().businessHours);
  holidays = computed(() => this._state().holidays);
  isLoading = computed(() => this._state().isLoading);
  
  // Reference data
  countryName = computed(() => this._referenceData().countryName);
  currencyCode = computed(() => this._referenceData().currencyCode);
  timeZoneName = computed(() => this._referenceData().timeZoneName);
  dateFormatString = computed(() => this._referenceData().dateFormatString);

  // State management methods
  setCompany(company: Company | null): void {
    this._state.update(state => ({ ...state, company }));
  }

  setBusinessDays(businessDays: BusinessDay[]): void {
    this._state.update(state => ({ ...state, businessDays }));
  }

  setBusinessHours(businessHours: BusinessHours[]): void {
    this._state.update(state => ({ ...state, businessHours }));
  }

  setHolidays(holidays: BusinessHoliday[]): void {
    this._state.update(state => ({ ...state, holidays }));
  }

  setLoading(isLoading: boolean): void {
    this._state.update(state => ({ ...state, isLoading }));
  }

  setReferenceData(data: Partial<ReferenceData>): void {
    this._referenceData.update(current => ({ ...current, ...data }));
  }

  // Reset state
  reset(): void {
    this._state.set({
      company: null,
      businessDays: [],
      businessHours: [],
      holidays: [],
      isLoading: false
    });
    this._referenceData.set({
      countryName: 'Loading...',
      currencyCode: 'Loading...',
      timeZoneName: 'Loading...',
      dateFormatString: 'Loading...'
    });
  }
}
