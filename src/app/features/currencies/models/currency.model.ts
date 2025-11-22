export interface Currency {
  currencyId: string;
  currencyCode: string;
  currencySymbol?: string;
  decimalPlaces: number;
  isDefault: boolean;
  status: string; // 'Active' | 'Inactive'
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
