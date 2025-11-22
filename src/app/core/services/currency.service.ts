import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Currency } from '../../features/currencies/models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private mockCurrencies: Currency[] = [
    {
      currencyId: '1',
      currencyCode: 'USD',
      currencySymbol: '$',
      decimalPlaces: 2,
      isDefault: true,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      currencyId: '2',
      currencyCode: 'AED',
      currencySymbol: 'د.إ',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      currencyId: '3',
      currencyCode: 'EUR',
      currencySymbol: '€',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-01'),
      createdBy: '1'
    },
    {
      currencyId: '4',
      currencyCode: 'GBP',
      currencySymbol: '£',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      currencyId: '5',
      currencyCode: 'INR',
      currencySymbol: '₹',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      createdBy: '1'
    },
    {
      currencyId: '6',
      currencyCode: 'JPY',
      currencySymbol: '¥',
      decimalPlaces: 0,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      currencyId: '7',
      currencyCode: 'CNY',
      currencySymbol: '¥',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Active',
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      createdBy: '1'
    },
    {
      currencyId: '8',
      currencyCode: 'AUD',
      currencySymbol: 'A$',
      decimalPlaces: 2,
      isDefault: false,
      status: 'Inactive',
      isDeleted: false,
      createdAt: new Date('2024-01-04'),
      createdBy: '1'
    }
  ];

  getCurrencies(): Observable<Currency[]> {
    return of(this.mockCurrencies).pipe(delay(300));
  }

  getCurrencyById(id: string): Observable<Currency | undefined> {
    return of(this.mockCurrencies.find(c => c.currencyId === id)).pipe(delay(300));
  }

  createCurrency(currency: Partial<Currency>): Observable<Currency> {
    const newCurrency: Currency = {
      currencyId: (this.mockCurrencies.length + 1).toString(),
      currencyCode: currency.currencyCode || '',
      currencySymbol: currency.currencySymbol,
      decimalPlaces: currency.decimalPlaces || 2,
      isDefault: currency.isDefault || false,
      status: currency.status || 'Active',
      isDeleted: false,
      createdAt: new Date(),
      createdBy: '1'
    };
    this.mockCurrencies.push(newCurrency);
    return of(newCurrency).pipe(delay(300));
  }

  updateCurrency(id: string, currency: Partial<Currency>): Observable<Currency | undefined> {
    const index = this.mockCurrencies.findIndex(c => c.currencyId === id);
    if (index !== -1) {
      this.mockCurrencies[index] = { 
        ...this.mockCurrencies[index], 
        ...currency, 
        updatedAt: new Date(), 
        updatedBy: '1' 
      };
      return of(this.mockCurrencies[index]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteCurrency(id: string): Observable<boolean> {
    const index = this.mockCurrencies.findIndex(c => c.currencyId === id);
    if (index !== -1) {
      this.mockCurrencies.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
