import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyViewStateService } from '../services/company-view-state.service';
import { BusinessHoliday } from '../models/company.model';

@Component({
  selector: 'app-holidays-view',
  imports: [CommonModule],
  templateUrl: './holidays-view.component.html',
  styleUrl: './holidays-view.component.css',
})
export class HolidaysViewComponent {
  private stateService = inject(CompanyViewStateService);
  
  holidays = this.stateService.holidays;
  
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  getHolidayTypeColor(type: string): string {
    switch (type) {
      case 'Public': return 'emerald';
      case 'Company': return 'blue';
      case 'Optional': return 'amber';
      default: return 'gray';
    }
  }
  
  getHolidayTypeIcon(type: string): string {
    switch (type) {
      case 'Public': return 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'Company': return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
      case 'Optional': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
    }
  }
}
