export interface Module {
  moduleId: string;
  moduleKey: string;
  moduleName: string;  
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
