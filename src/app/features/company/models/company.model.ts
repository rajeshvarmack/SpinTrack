export interface Company {
  companyId: string;
  companyCode: string;
  companyName: string;
  countryId: string;
  currencyId: string;
  timeZoneId: string;
  dateFormatId?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  fiscalYearStartMonth: number; // 1-12
  status: string; // 'Active' | 'Inactive'
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface BusinessDay {
  businessDayId: string;
  companyId: string;
  dayOfWeek: string; // 'Sunday', 'Monday', etc.
  isWorkingDay: boolean;
  isWeekend: boolean;
  remarks?: string;
  status: string;
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface BusinessHours {
  businessHoursId: string;
  companyId: string;
  dayOfWeek: string;
  shiftName: string;
  startTime: string; // 'HH:mm:ss'
  endTime: string; // 'HH:mm:ss'
  isWorkingShift: boolean;
  isOvertimeEligible: boolean;
  remarks?: string;
  status: string;
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface BusinessHoliday {
  businessHolidayId: string;
  companyId: string;
  holidayDate: Date | string;
  holidayName: string;
  holidayType: string; // 'Public', 'Company', 'Optional'
  countryId?: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  status: string;
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
