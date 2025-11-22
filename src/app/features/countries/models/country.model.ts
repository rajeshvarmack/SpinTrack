export interface Country {
  countryId: string;
  countryCodeISO2: string;
  countryCodeISO3: string;
  countryName: string;
  phoneCode?: string;
  continent?: string;
  status: string; // 'Active' | 'Inactive'
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
