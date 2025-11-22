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
  private businessHolidays: BusinessHoliday[] = [];

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
}
