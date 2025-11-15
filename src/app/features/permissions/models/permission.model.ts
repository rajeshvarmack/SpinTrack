export interface Permission {
  permissionId: string;
  permissionKey: string;
  permissionName: string;
  moduleId: string;
  moduleName?: string;  
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
