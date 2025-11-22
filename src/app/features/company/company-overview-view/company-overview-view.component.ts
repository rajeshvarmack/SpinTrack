import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyViewStateService } from '../services/company-view-state.service';

@Component({
  selector: 'app-company-overview-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-overview-view.component.html',
  styleUrls: ['./company-overview-view.component.css']
})
export class CompanyOverviewViewComponent {
  private stateService = inject(CompanyViewStateService);

  // Computed values from state
  company = computed(() => this.stateService.company());
  countryName = computed(() => this.stateService.countryName());
  currencyCode = computed(() => this.stateService.currencyCode());
  timeZoneName = computed(() => this.stateService.timeZoneName());
  dateFormatString = computed(() => this.stateService.dateFormatString());

  fiscalMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  getFiscalMonthName(monthNumber: number): string {
    return this.fiscalMonths[monthNumber - 1] || 'Unknown';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  
  getCompanyInitials(companyName: string): string {
    if (!companyName) return '?';
    const words = companyName.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
  
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    // The @else block will automatically show the initials
  }
}


