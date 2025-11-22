export interface TimeZone {
  timeZoneId: string;
  timeZoneName: string;
  gmtOffset?: string;
  supportsDST: boolean;
  status: string; // 'Active' | 'Inactive'
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
