import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TimeZone } from '../../features/timezones/models/timezone.model';

@Injectable({
  providedIn: 'root',
})
export class TimeZoneService {
  private mockTimeZones: TimeZone[] = [
    {
      timeZoneId: '1',
      timeZoneName: 'Asia/Dubai',
      gmtOffset: '+04:00',
      supportsDST: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      timeZoneId: '2',
      timeZoneName: 'America/New_York',
      gmtOffset: '-05:00',
      supportsDST: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      timeZoneId: '3',
      timeZoneName: 'Europe/London',
      gmtOffset: '+00:00',
      supportsDST: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      timeZoneId: '4',
      timeZoneName: 'Asia/Tokyo',
      gmtOffset: '+09:00',
      supportsDST: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      timeZoneId: '5',
      timeZoneName: 'Asia/Kolkata',
      gmtOffset: '+05:30',
      supportsDST: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      timeZoneId: '6',
      timeZoneName: 'Australia/Sydney',
      gmtOffset: '+11:00',
      supportsDST: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      timeZoneId: '7',
      timeZoneName: 'Europe/Paris',
      gmtOffset: '+01:00',
      supportsDST: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      timeZoneId: '8',
      timeZoneName: 'Pacific/Auckland',
      gmtOffset: '+13:00',
      supportsDST: true,
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-01-04'),
      createdBy: '1'
    }
  ];

  getTimeZones(): Observable<TimeZone[]> {
    return of(this.mockTimeZones).pipe(delay(300));
  }

  getTimeZoneById(id: string): Observable<TimeZone | undefined> {
    return of(this.mockTimeZones.find(tz => tz.timeZoneId === id)).pipe(delay(300));
  }

  createTimeZone(timeZone: Partial<TimeZone>): Observable<TimeZone> {
    const newTimeZone: TimeZone = {
      timeZoneId: (this.mockTimeZones.length + 1).toString(),
      timeZoneName: timeZone.timeZoneName || '',
      gmtOffset: timeZone.gmtOffset,
      supportsDST: timeZone.supportsDST || false,
      status: timeZone.status || 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: '1'
    };
    this.mockTimeZones.push(newTimeZone);
    return of(newTimeZone).pipe(delay(300));
  }

  updateTimeZone(id: string, timeZone: Partial<TimeZone>): Observable<TimeZone | undefined> {
    const index = this.mockTimeZones.findIndex(tz => tz.timeZoneId === id);
    if (index !== -1) {
      this.mockTimeZones[index] = { 
        ...this.mockTimeZones[index], 
        ...timeZone, 
        updatedAt: new Date(), 
        updatedBy: '1' 
      };
      return of(this.mockTimeZones[index]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteTimeZone(id: string): Observable<boolean> {
    const index = this.mockTimeZones.findIndex(tz => tz.timeZoneId === id);
    if (index !== -1) {
      this.mockTimeZones.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
