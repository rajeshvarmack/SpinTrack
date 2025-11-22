import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyViewStateService } from '../services/company-view-state.service';

@Component({
  selector: 'app-business-schedule-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-schedule-view.component.html',
  styleUrls: ['./business-schedule-view.component.css']
})
export class BusinessScheduleViewComponent {
  private stateService = inject(CompanyViewStateService);

  // Computed values from state
  businessDays = computed(() => this.stateService.businessDays());
  businessHours = computed(() => this.stateService.businessHours());
  holidays = computed(() => this.stateService.holidays());

  // Helper to get working days count
  getWorkingDaysCount(): number {
    return this.businessDays().filter(day => day.isWorkingDay).length;
  }

  // Calculate duration between start and end time
  calculateDuration(startTime: string | null | undefined, endTime: string | null | undefined): number {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return Math.round((endMinutes - startMinutes) / 60 * 10) / 10; // Round to 1 decimal place
  }

  // Sort holidays by date (upcoming first)
  sortedHolidays = computed(() => {
    return [...this.holidays()].sort((a, b) => {
      const dateA = new Date(a.holidayDate).getTime();
      const dateB = new Date(b.holidayDate).getTime();
      return dateA - dateB;
    });
  });

  // Date formatting helpers
  getMonthName(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }

  getDay(date: Date | string): number {
    return new Date(date).getDate();
  }

  getDayOfWeek(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  }
}


