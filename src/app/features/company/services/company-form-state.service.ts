import { Injectable, signal, computed } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Company } from '../models/company.model';

interface CompanyFormState {
  company: Company | null;
  logoPreview: string | null;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyFormStateService {
  // State signals
  private _state = signal<CompanyFormState>({
    company: null,
    logoPreview: null,
    isDirty: false,
    isLoading: false,
    isSaving: false
  });

  // Public computed signals
  company = computed(() => this._state().company);
  logoPreview = computed(() => this._state().logoPreview);
  isDirty = computed(() => this._state().isDirty);
  isLoading = computed(() => this._state().isLoading);
  isSaving = computed(() => this._state().isSaving);

  // Form reference (shared across components)
  private _companyForm: FormGroup | null = null;

  constructor() { }

  // State management methods
  setCompany(company: Company | null): void {
    this._state.update(state => ({ ...state, company }));
  }

  setLogoPreview(logoPreview: string | null): void {
    this._state.update(state => ({ ...state, logoPreview }));
  }

  setDirty(isDirty: boolean): void {
    this._state.update(state => ({ ...state, isDirty }));
  }

  setLoading(isLoading: boolean): void {
    this._state.update(state => ({ ...state, isLoading }));
  }

  setSaving(isSaving: boolean): void {
    this._state.update(state => ({ ...state, isSaving }));
  }

  // Form management
  setForm(form: FormGroup): void {
    this._companyForm = form;
    
    // Track form changes
    form.valueChanges.subscribe(() => {
      this.setDirty(form.dirty);
    });
  }

  getForm(): FormGroup | null {
    return this._companyForm;
  }

  // Reset state
  reset(): void {
    this._state.set({
      company: null,
      logoPreview: null,
      isDirty: false,
      isLoading: false,
      isSaving: false
    });
    this._companyForm = null;
  }

  // Validation helper
  canDeactivate(): boolean {
    return !this.isDirty();
  }
}
