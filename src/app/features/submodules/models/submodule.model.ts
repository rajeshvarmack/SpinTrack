export interface SubModule {
  subModuleId: string;
  moduleId: string;
  moduleName?: string; // For display purposes
  subModuleKey: string;
  subModuleName: string;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
