import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Country } from '../../features/countries/models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private mockCountries: Country[] = [
    {
      countryId: '1',
      countryCodeISO2: 'US',
      countryCodeISO3: 'USA',
      countryName: 'United States',
      phoneCode: '+1',
      continent: 'North America',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      countryId: '2',
      countryCodeISO2: 'IN',
      countryCodeISO3: 'IND',
      countryName: 'India',
      phoneCode: '+91',
      continent: 'Asia',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      countryId: '3',
      countryCodeISO2: 'GB',
      countryCodeISO3: 'GBR',
      countryName: 'United Kingdom',
      phoneCode: '+44',
      continent: 'Europe',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      countryId: '4',
      countryCodeISO2: 'CA',
      countryCodeISO3: 'CAN',
      countryName: 'Canada',
      phoneCode: '+1',
      continent: 'North America',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      countryId: '5',
      countryCodeISO2: 'AU',
      countryCodeISO3: 'AUS',
      countryName: 'Australia',
      phoneCode: '+61',
      continent: 'Oceania',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      countryId: '6',
      countryCodeISO2: 'DE',
      countryCodeISO3: 'DEU',
      countryName: 'Germany',
      phoneCode: '+49',
      continent: 'Europe',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      countryId: '7',
      countryCodeISO2: 'FR',
      countryCodeISO3: 'FRA',
      countryName: 'France',
      phoneCode: '+33',
      continent: 'Europe',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      countryId: '8',
      countryCodeISO2: 'JP',
      countryCodeISO3: 'JPN',
      countryName: 'Japan',
      phoneCode: '+81',
      continent: 'Asia',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-04'),
      createdBy: '1'
    },
    {
      countryId: '9',
      countryCodeISO2: 'BR',
      countryCodeISO3: 'BRA',
      countryName: 'Brazil',
      phoneCode: '+55',
      continent: 'South America',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-04'),
      createdBy: '1'
    },
    {
      countryId: '10',
      countryCodeISO2: 'CN',
      countryCodeISO3: 'CHN',
      countryName: 'China',
      phoneCode: '+86',
      continent: 'Asia',
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-01-05'),
      createdBy: '1'
    },
    {
      countryId: '11',
      countryCodeISO2: 'MX',
      countryCodeISO3: 'MEX',
      countryName: 'Mexico',
      phoneCode: '+52',
      continent: 'North America',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-05'),
      createdBy: '1'
    },
    {
      countryId: '12',
      countryCodeISO2: 'IT',
      countryCodeISO3: 'ITA',
      countryName: 'Italy',
      phoneCode: '+39',
      continent: 'Europe',
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-06'),
      createdBy: '1'
    }
  ];

  getCountries(): Observable<Country[]> {
    return of(this.mockCountries).pipe(delay(300));
  }

  getCountryById(id: string): Observable<Country | undefined> {
    return of(this.mockCountries.find(c => c.countryId === id)).pipe(delay(300));
  }

  createCountry(country: Partial<Country>): Observable<Country> {
    const newCountry: Country = {
      countryId: (this.mockCountries.length + 1).toString(),
      countryCodeISO2: country.countryCodeISO2 || '',
      countryCodeISO3: country.countryCodeISO3 || '',
      countryName: country.countryName || '',
      phoneCode: country.phoneCode,
      continent: country.continent,
      status: country.status || 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: '1'
    };
    this.mockCountries.push(newCountry);
    return of(newCountry).pipe(delay(300));
  }

  updateCountry(id: string, country: Partial<Country>): Observable<Country | undefined> {
    const index = this.mockCountries.findIndex(c => c.countryId === id);
    if (index !== -1) {
      this.mockCountries[index] = { 
        ...this.mockCountries[index], 
        ...country, 
        updatedAt: new Date(), 
        updatedBy: '1' 
      };
      return of(this.mockCountries[index]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteCountry(id: string): Observable<boolean> {
    const index = this.mockCountries.findIndex(c => c.countryId === id);
    if (index !== -1) {
      this.mockCountries.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
