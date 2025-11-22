import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CompanyService } from '../services/company.service';
import { CompanyViewStateService } from '../services/company-view-state.service';
import { CountryService } from '../../../core/services/country.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TimeZoneService } from '../../../core/services/timezone.service';
import { DateFormatService } from '../../../core/services/date-format.service';
import { Company } from '../models/company.model';

interface Tab {
  id: string;
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-company-view',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.css']
})
export class CompanyViewComponent implements OnInit {
  private companyService = inject(CompanyService);
  private countryService = inject(CountryService);
  private currencyService = inject(CurrencyService);
  private timeZoneService = inject(TimeZoneService);
  private dateFormatService = inject(DateFormatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // Inject state service
  stateService = inject(CompanyViewStateService);

  companyId = signal<string | null>(null);
  activeTab = signal<string>('overview');
  
  // Tab configuration
  tabs: Tab[] = [
    { id: 'overview', label: 'Overview', route: 'overview', icon: 'building' },
    { id: 'business_days', label: 'Business Schedule', route: 'business_days', icon: 'calendar' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.companyId.set(id);
      this.stateService.setLoading(true);
      this.loadCompanyData(id);
    }

    // Update active tab based on current route
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url.split('/').pop();
      const matchingTab = this.tabs.find(tab => tab.route === currentRoute);
      if (matchingTab) {
        this.activeTab.set(matchingTab.id);
      }
    });
  }

  loadCompanyData(id: string) {
    this.companyService.getCompanyById(id).subscribe(data => {
      this.stateService.setCompany(data || null);
      if (data) {
        this.loadReferenceData(data);
      }
      this.stateService.setLoading(false);
    });
    
    this.companyService.getBusinessDays(id).subscribe(days => {
      this.stateService.setBusinessDays(days);
    });
  }

  loadReferenceData(company: Company) {
    this.countryService.getCountryById(company.countryId).subscribe(c => 
      this.stateService.setReferenceData({ countryName: c?.countryName || 'Unknown' })
    );
    this.currencyService.getCurrencyById(company.currencyId).subscribe(c => 
      this.stateService.setReferenceData({ currencyCode: c?.currencyCode || 'Unknown' })
    );
    this.timeZoneService.getTimeZoneById(company.timeZoneId).subscribe(t => 
      this.stateService.setReferenceData({ timeZoneName: t?.timeZoneName || 'Unknown' })
    );
    if (company.dateFormatId) {
      this.dateFormatService.getDateFormatById(company.dateFormatId).subscribe(d => 
        this.stateService.setReferenceData({ dateFormatString: d?.formatString || 'Unknown' })
      );
    } else {
      this.stateService.setReferenceData({ dateFormatString: 'Not Set' });
    }
  }

  navigateToTab(tab: Tab) {
    this.activeTab.set(tab.id);
    const basePath = `/companies/${this.companyId()}`;
    this.router.navigate([basePath, tab.route]);
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab() === tabId;
  }

  goBack() {
    this.stateService.reset();
    this.router.navigate(['/companies']);
  }

  editCompany() {
    const id = this.companyId();
    if (id) {
      this.router.navigate(['/companies', id, 'edit']);
    }
  }

  deleteCompany() {
    const company = this.stateService.company();
    if (company && confirm(`Are you sure you want to delete ${company.companyName}?`)) {
      this.companyService.deleteCompany(company.companyId).subscribe(() => {
        this.goBack();
      });
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  getCompanyInitials(companyName: string): string {
    if (!companyName) return 'CO';
    const words = companyName.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  onImageError(event: Event, companyName: string): void {
    const imgElement = event.target as HTMLImageElement;
    // Hide broken image and show fallback
    imgElement.style.display = 'none';
    const fallback = imgElement.nextElementSibling;
    if (fallback) {
      (fallback as HTMLElement).style.display = 'flex';
    }
  }
}
