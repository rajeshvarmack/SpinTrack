export interface Role {
  roleId: string;
  roleName: string;
  description?: string;  
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  permissions?: string[]; // Array of permission IDs
}
