export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  roles?: Role[];
}

export interface Role {
  roleId: string;
  roleName: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  permissions?: Permission[];
}

export interface Module {
  moduleId: string;
  moduleKey: string;
  moduleName: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

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

export interface UserRole {
  userRoleId: string;
  userId: string;
  roleId: string;
  createdAt: Date;
  createdBy: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentUsers: User[];
  userGrowth: string;
  roleGrowth: string;
}
