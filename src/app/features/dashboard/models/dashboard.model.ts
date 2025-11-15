import { User } from '../../users/models/user.model';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentUsers: User[];
  userGrowth: string;
  roleGrowth: string;
}
