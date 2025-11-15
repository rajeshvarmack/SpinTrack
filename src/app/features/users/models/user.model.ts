export interface User {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  roles?: string[]; // Array of role IDs
}

export interface UserRole {
  userRoleId: string;
  userId: string;
  roleId: string;
  createdAt: Date;
  createdBy: string;
}
