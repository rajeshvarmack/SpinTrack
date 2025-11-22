import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Company, BusinessDay, BusinessHours, BusinessHoliday } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companies: Company[] = [
    {
      companyId: '1',
      companyCode: 'CMP-001',
      companyName: 'Acme Corp',
      countryId: '1', // Assumes US exists
      currencyId: '1', // Assumes USD exists
      timeZoneId: '1', // Assumes EST exists
      dateFormatId: '1',
      website: 'https://www.acmecorp.com',
      address: '123 Acme Way, Business City, US',
      logoUrl: 'assets/images/logo-placeholder.png',
      fiscalYearStartMonth: 1,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    }
  ];

  private businessDays: BusinessDay[] = [];
  private businessHours: BusinessHours[] = [];
  private businessHolidays: BusinessHoliday[] = this.generateSampleHolidays('1');

  // --- Company CRUD ---
  getCompanies(): Observable<Company[]> {
    return of(this.companies).pipe(delay(300));
  }

  getCompanyById(id: string): Observable<Company | undefined> {
    const company = this.companies.find(c => c.companyId === id);
    return of(company).pipe(delay(300));
  }

  createCompany(company: Company): Observable<Company> {
    this.companies = [...this.companies, company];
    return of(company).pipe(delay(300));
  }

  updateCompany(id: string, company: Company): Observable<Company> {
    const index = this.companies.findIndex(c => c.companyId === id);
    if (index !== -1) {
      this.companies[index] = { ...company };
      this.companies = [...this.companies];
    }
    return of(company).pipe(delay(300));
  }

  deleteCompany(id: string): Observable<void> {
    this.companies = this.companies.filter(c => c.companyId !== id);
    return of(void 0).pipe(delay(300));
  }

  // --- Sub-Entity Methods (Mock Implementation) ---
  // In a real API, these might be separate endpoints or included in the Company object

  getBusinessDays(companyId: string): Observable<BusinessDay[]> {
    // Return default M-F if none exist
    const days = this.businessDays.filter(d => d.companyId === companyId);
    if (days.length === 0) {
        return of(this.generateDefaultBusinessDays(companyId)).pipe(delay(300));
    }
    return of(days).pipe(delay(300));
  }
  
  saveBusinessDays(days: BusinessDay[]): Observable<BusinessDay[]> {
      // Mock save
      this.businessDays = [...this.businessDays.filter(d => d.companyId !== days[0].companyId), ...days];
      return of(days).pipe(delay(300));
  }

  getBusinessHours(companyId: string): Observable<BusinessHours[]> {
    const hours = this.businessHours.filter(h => h.companyId === companyId);
    if (hours.length === 0) {
      return of(this.generateDefaultBusinessHours(companyId)).pipe(delay(300));
    }
    return of(hours).pipe(delay(300));
  }

  saveBusinessHours(hours: BusinessHours[]): Observable<BusinessHours[]> {
    // Since we might be saving a list that replaces the old list for a company,
    // or just adding/updating. Let's assume we replace all hours for the company
    // or we need to handle it more granularly.
    // For simplicity in this mock, let's replace all for the company if the input is the full list.
    // But usually save might be for a single item or a list.
    // Let's assume the component sends the full list of active shifts.
    
    if (hours.length > 0) {
        const companyId = hours[0].companyId;
        this.businessHours = [...this.businessHours.filter(h => h.companyId !== companyId), ...hours];
    }
    return of(hours).pipe(delay(300));
  }

  // --- Business Holidays ---
  getBusinessHolidays(companyId: string): Observable<BusinessHoliday[]> {
    const holidays = this.businessHolidays.filter(h => h.companyId === companyId && !h.isDeleted);
    return of(holidays).pipe(delay(300));
  }

  saveBusinessHoliday(holiday: BusinessHoliday): Observable<BusinessHoliday> {
    const existingIndex = this.businessHolidays.findIndex(
      h => h.businessHolidayId === holiday.businessHolidayId
    );
    
    if (existingIndex !== -1) {
      // Update existing
      this.businessHolidays[existingIndex] = { ...holiday, updatedAt: new Date() };
      this.businessHolidays = [...this.businessHolidays];
    } else {
      // Add new
      this.businessHolidays = [...this.businessHolidays, holiday];
    }
    
    return of(holiday).pipe(delay(300));
  }

  deleteBusinessHoliday(holidayId: string): Observable<void> {
    const index = this.businessHolidays.findIndex(h => h.businessHolidayId === holidayId);
    if (index !== -1) {
      this.businessHolidays[index] = { ...this.businessHolidays[index], isDeleted: true };
      this.businessHolidays = [...this.businessHolidays];
    }
    return of(void 0).pipe(delay(300));
  }

  private generateDefaultBusinessDays(companyId: string): BusinessDay[] {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.map(day => ({
          businessDayId: crypto.randomUUID(),
          companyId,
          dayOfWeek: day,
          isWorkingDay: day !== 'Saturday' && day !== 'Sunday',
          isWeekend: day === 'Saturday' || day === 'Sunday',
          status: 'Active',
          createdAt: new Date(),
          createdBy: 'system'
      }));
  }

  private generateDefaultBusinessHours(companyId: string): BusinessHours[] {
    const workingDays = [
      { day: 'Monday', start: '09:00', end: '17:00', shift: 'Standard' },
      { day: 'Tuesday', start: '09:00', end: '17:00', shift: 'Standard' },
      { day: 'Wednesday', start: '09:00', end: '17:00', shift: 'Standard' },
      { day: 'Thursday', start: '09:00', end: '17:00', shift: 'Standard' },
      { day: 'Friday', start: '09:00', end: '17:00', shift: 'Standard' },
    ];
    
    const weekendDays = [
      { day: 'Saturday', start: null, end: null, shift: 'Closed' },
      { day: 'Sunday', start: null, end: null, shift: 'Closed' }
    ];
    
    const allDays = [...workingDays, ...weekendDays];
    
    return allDays.map(({ day, start, end, shift }) => ({
      businessHoursId: crypto.randomUUID(),
      companyId,
      dayOfWeek: day,
      shiftName: shift,
      startTime: start || '00:00',
      endTime: end || '00:00',
      isWorkingShift: shift !== 'Closed',
      isOvertimeEligible: false,
      status: shift !== 'Closed' ? 'Active' : 'Inactive',
      createdAt: new Date(),
      createdBy: 'system'
    }));
  }

  private generateSampleHolidays(companyId: string): BusinessHoliday[] {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    return [
      // Public Holidays
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 0, 1),
        holidayName: "New Year's Day",
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 0, 20),
        holidayName: 'Martin Luther King Jr. Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 1, 17),
        holidayName: "Presidents' Day",
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 4, 26),
        holidayName: 'Memorial Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 6, 4),
        holidayName: 'Independence Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 8, 1),
        holidayName: 'Labor Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 10, 11),
        holidayName: 'Veterans Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 10, 27),
        holidayName: 'Thanksgiving Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 11, 25),
        holidayName: 'Christmas Day',
        holidayType: 'Public',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      
      // Company Holidays
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 2, 15),
        holidayName: 'Company Founding Day',
        holidayType: 'Company',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 5, 20),
        holidayName: 'Annual Team Building Day',
        holidayType: 'Company',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 11, 24),
        holidayName: 'Christmas Eve (Half Day)',
        holidayType: 'Company',
        isFullDay: false,
        startTime: '09:00',
        endTime: '13:00',
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 11, 31),
        holidayName: 'Year-End Closure',
        holidayType: 'Company',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      
      // Optional Holidays
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 3, 1),
        holidayName: 'Spring Wellness Day',
        holidayType: 'Optional',
        isFullDay: true,
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 7, 15),
        holidayName: 'Summer Break (Half Day)',
        holidayType: 'Optional',
        isFullDay: false,
        startTime: '09:00',
        endTime: '13:00',
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        businessHolidayId: crypto.randomUUID(),
        companyId,
        holidayDate: new Date(nextYear, 9, 31),
        holidayName: 'Halloween Celebration',
        holidayType: 'Optional',
        isFullDay: false,
        startTime: '14:00',
        endTime: '17:00',
        status: 'Active',
        isDeleted: false,
        createdAt: new Date(),
        createdBy: 'system'
      }
    ];
  }
}
