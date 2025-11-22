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
}


