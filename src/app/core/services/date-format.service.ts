import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DateFormat } from '../../features/date-formats/models/date-format.model';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {
  private dateFormats: DateFormat[] = [
    {
      dateFormatId: '1',
      formatString: 'dd/MM/yyyy',
      description: 'Day/Month/Year (e.g., 22/11/2025)',
      isDefault: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      dateFormatId: '2',
      formatString: 'MM/dd/yyyy',
      description: 'Month/Day/Year (e.g., 11/22/2025)',
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      dateFormatId: '3',
      formatString: 'yyyy-MM-dd',
      description: 'ISO 8601 (e.g., 2025-11-22)',
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      dateFormatId: '4',
      formatString: 'dd-MMM-yyyy',
      description: 'Day-MonthAbbr-Year (e.g., 22-Nov-2025)',
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      dateFormatId: '5',
      formatString: 'MMMM dd, yyyy',
      description: 'MonthName Day, Year (e.g., November 22, 2025)',
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      dateFormatId: '6',
      formatString: 'EEE, dd MMM yyyy',
      description: 'DayName, Day MonthAbbr Year (e.g., Sat, 22 Nov 2025)',
      isDefault: false,
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: 'system'
    }
  ];

  getDateFormats(): Observable<DateFormat[]> {
    return of(this.dateFormats).pipe(delay(300));
  }

  getDateFormatById(id: string): Observable<DateFormat | undefined> {
    const dateFormat = this.dateFormats.find(d => d.dateFormatId === id);
    return of(dateFormat).pipe(delay(300));
  }

  createDateFormat(dateFormat: DateFormat): Observable<DateFormat> {
    this.dateFormats = [...this.dateFormats, dateFormat];
    return of(dateFormat).pipe(delay(300));
  }

  updateDateFormat(id: string, dateFormat: DateFormat): Observable<DateFormat> {
    const index = this.dateFormats.findIndex(d => d.dateFormatId === id);
    if (index !== -1) {
      this.dateFormats[index] = { ...dateFormat };
      this.dateFormats = [...this.dateFormats]; // Trigger change detection if needed
    }
    return of(dateFormat).pipe(delay(300));
  }

  deleteDateFormat(id: string): Observable<void> {
    this.dateFormats = this.dateFormats.filter(d => d.dateFormatId !== id);
    return of(void 0).pipe(delay(300));
  }
}
