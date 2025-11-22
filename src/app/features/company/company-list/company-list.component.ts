import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, PLATFORM_ID, DestroyRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Company } from '../models/company.model';
import { CompanyService } from '../services/company.service';
import { CountryService } from '../../../core/services/country.service';
import { Country } from '../../countries/models/country.model';
import { PrimeNgTableModule } from '../../../shared/modules/primeng-table.module';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, PrimeNgTableModule],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private countryService = inject(CountryService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  companies = signal<Company[]>([]);
  countries = signal<Country[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  rowsPerPage = signal(10);
  tableScrollHeight = signal('400px');

  constructor() {
    const destroyRef = inject(DestroyRef);
    
    if (isPlatformBrowser(this.platformId)) {
      this.calculateRowsPerPage();
      
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(200),
          takeUntilDestroyed(destroyRef)
        )
        .subscribe(() => this.calculateRowsPerPage());
    }
  }

  filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const companiesArr = this.companies() ?? [];
    if (!term) return companiesArr;
    return companiesArr.filter(c => 
      c.companyName.toLowerCase().includes(term) || 
      c.companyCode.toLowerCase().includes(term)
    );
  });

  allCompaniesCount = computed(() => (this.companies() ?? []).length);
  activeCompaniesCount = computed(() => (this.companies() ?? []).filter(c => c.status === 'Active').length);
  inactiveCompaniesCount = computed(() => (this.companies() ?? []).filter(c => c.status === 'Inactive').length);

  private calculateRowsPerPage(): void {
    // Calculate based on ACTUAL viewport and measurements (matching UserList logic)
    const componentPadding = 24;
    const headerHeight = 44;
    const searchHeight = 58;
    const cardsHeight = 116;
    const spacingTotal = 36;
    const tableChromeHeight = 105;
    
    const totalOverhead = componentPadding + headerHeight + searchHeight + cardsHeight + spacingTotal + tableChromeHeight;
    const availableHeight = window.innerHeight - totalOverhead;
    const rowHeight = 49;
    
    const calculatedRows = Math.max(5, Math.floor(availableHeight / rowHeight));
    this.rowsPerPage.set(calculatedRows);
    
    const tableBodyHeight = calculatedRows * rowHeight;
    this.tableScrollHeight.set(`${Math.max(300, tableBodyHeight)}px`);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    // Load countries first for flag lookup, then companies
    this.countryService.getCountries().subscribe(countryData => {
      this.countries.set(countryData);
      
      this.companyService.getCompanies().subscribe({
        next: (companyData) => {
          this.companies.set(companyData);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading companies:', err);
          this.loading.set(false);
        }
      });
    });
  }

  searchCompanies(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  getCountryName(countryId: string): string {
    return this.countries().find(c => c.countryId === countryId)?.countryName || 'Unknown';
  }

  getCountryFlag(countryId: string): string {
    const code = this.countries().find(c => c.countryId === countryId)?.countryCodeISO2;
    if (!code) return '🏳️';
    return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  }

  getAvatarColor(name: string): string {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-cyan-400 to-cyan-600',
      'from-indigo-400 to-indigo-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
      'from-violet-400 to-violet-600',
      'from-sky-400 to-sky-600'
    ];
    const index = name.length % colors.length;
    return colors[index];
  }

  navigateToAdd() {
    this.router.navigate(['/companies/add']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/companies', id, 'edit']);
  }

  navigateToView(id: string) {
    this.router.navigate(['/companies', id]);
  }
}
