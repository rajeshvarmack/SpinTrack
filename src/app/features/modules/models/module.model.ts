export interface Module {
  moduleId: string;
  moduleKey: string;
  moduleName: string;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
