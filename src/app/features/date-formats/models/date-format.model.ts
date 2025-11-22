export interface DateFormat {
  dateFormatId: string;
  formatString: string;
  description?: string;
  isDefault: boolean;
  status: string; // 'Active' | 'Inactive'
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
