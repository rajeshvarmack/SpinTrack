import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyViewStateService } from '../services/company-view-state.service';

@Component({
  selector: 'app-business-hours-view',
  imports: [CommonModule],
  templateUrl: './business-hours-view.component.html',
  styleUrl: './business-hours-view.component.css',
})
export class BusinessHoursViewComponent {
  private stateService = inject(CompanyViewStateService);
  
  businessHours = this.stateService.businessHours;
  
  getTimeDisplay(time: string): string {
    // Convert 'HH:mm:ss' to '12:00 AM/PM' format
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }
  
  getDuration(startTime: string, endTime: string): string {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
