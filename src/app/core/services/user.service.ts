import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User } from '../../features/users/models/user.model';
import { DashboardStats } from '../../features/dashboard/models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private mockUsers: User[] = [
    {
      userId: '1',
      username: 'admin',
      email: 'admin@petrohub.com',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      status: 'Active',
      createdAt: new Date('2024-01-15'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '2',
      username: 'john.doe',
      email: 'john.doe@petrohub.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567891',
      status: 'Active',
      createdAt: new Date('2024-02-20'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '3',
      username: 'jane.smith',
      email: 'jane.smith@petrohub.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1234567892',
      status: 'Active',
      createdAt: new Date('2024-03-10'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '4',
      username: 'bob.wilson',
      email: 'bob.wilson@petrohub.com',
      firstName: 'Bob',
      middleName: 'J',
      lastName: 'Wilson',
      phoneNumber: '+1234567893',
      status: 'Inactive',
      createdAt: new Date('2024-04-05'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '5',
      username: 'sarah.jones',
      email: 'sarah.jones@petrohub.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      phoneNumber: '+1234567894',
      status: 'Active',
      createdAt: new Date('2024-05-12'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '6',
      username: 'michael.brown',
      email: 'michael.brown@petrohub.com',
      firstName: 'Michael',
      middleName: 'Anthony',
      lastName: 'Brown',
      phoneNumber: '+1234567895',
      status: 'Active',
      createdAt: new Date('2024-06-01'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '7',
      username: 'emily.davis',
      email: 'emily.davis@petrohub.com',
      firstName: 'Emily',
      lastName: 'Davis',
      phoneNumber: '+1234567896',
      status: 'Inactive',
      createdAt: new Date('2024-06-15'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '8',
      username: 'david.miller',
      email: 'david.miller@petrohub.com',
      firstName: 'David',
      lastName: 'Miller',
      phoneNumber: '+1234567897',
      status: 'Active',
      createdAt: new Date('2024-07-03'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '9',
      username: 'lisa.garcia',
      email: 'lisa.garcia@petrohub.com',
      firstName: 'Lisa',
      middleName: 'Marie',
      lastName: 'Garcia',
      phoneNumber: '+1234567898',
      status: 'Active',
      createdAt: new Date('2024-07-20'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '10',
      username: 'james.martinez',
      email: 'james.martinez@petrohub.com',
      firstName: 'James',
      lastName: 'Martinez',
      phoneNumber: '+1234567899',
      status: 'Suspended',
      createdAt: new Date('2024-08-05'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '11',
      username: 'jennifer.rodriguez',
      email: 'jennifer.rodriguez@petrohub.com',
      firstName: 'Jennifer',
      lastName: 'Rodriguez',
      phoneNumber: '+1234567800',
      status: 'Active',
      createdAt: new Date('2024-08-18'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '12',
      username: 'robert.wilson',
      email: 'robert.wilson@petrohub.com',
      firstName: 'Robert',
      middleName: 'Lee',
      lastName: 'Wilson',
      phoneNumber: '+1234567801',
      status: 'Active',
      createdAt: new Date('2024-09-02'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '13',
      username: 'mary.anderson',
      email: 'mary.anderson@petrohub.com',
      firstName: 'Mary',
      lastName: 'Anderson',
      phoneNumber: '+1234567802',
      status: 'Inactive',
      createdAt: new Date('2024-09-15'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '14',
      username: 'william.taylor',
      email: 'william.taylor@petrohub.com',
      firstName: 'William',
      lastName: 'Taylor',
      phoneNumber: '+1234567803',
      status: 'Active',
      createdAt: new Date('2024-10-01'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '15',
      username: 'patricia.thomas',
      email: 'patricia.thomas@petrohub.com',
      firstName: 'Patricia',
      lastName: 'Thomas',
      phoneNumber: '+1234567804',
      status: 'Active',
      createdAt: new Date('2024-10-12'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '16',
      username: 'charles.moore',
      email: 'charles.moore@petrohub.com',
      firstName: 'Charles',
      middleName: 'Edward',
      lastName: 'Moore',
      phoneNumber: '+1234567805',
      status: 'Active',
      createdAt: new Date('2024-10-25'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '17',
      username: 'linda.jackson',
      email: 'linda.jackson@petrohub.com',
      firstName: 'Linda',
      lastName: 'Jackson',
      phoneNumber: '+1234567806',
      status: 'Inactive',
      createdAt: new Date('2024-11-05'),
      createdBy: '1',
      roles: []
    },
    {
      userId: '18',
      username: 'thomas.white',
      email: 'thomas.white@petrohub.com',
      firstName: 'Thomas',
      lastName: 'White',
      phoneNumber: '+1234567807',
      status: 'Active',
      createdAt: new Date('2024-11-10'),
      createdBy: '1',
      roles: []
    }
  ];

  getUsers(): Observable<User[]> {
    return of(this.mockUsers).pipe(delay(300));
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.mockUsers.find(u => u.userId === id)).pipe(delay(300));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const activeUsers = this.mockUsers.filter(u => u.status === 'Active').length;
    return of({
      totalUsers: this.mockUsers.length,
      activeUsers: activeUsers,
      totalRoles: 8,
      totalPermissions: 42,
      recentUsers: this.mockUsers.slice(0, 3),
      userGrowth: '+12%',
      roleGrowth: '+3%'
    }).pipe(delay(300));
  }

  createUser(user: Partial<User>): Observable<User> {
    const newUser: User = {
      userId: (this.mockUsers.length + 1).toString(),
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      middleName: user.middleName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: 'Active',
      createdAt: new Date(),
      createdBy: '1',
      roles: []
    };
    this.mockUsers.push(newUser);
    return of(newUser).pipe(delay(300));
  }

  updateUser(id: string, user: Partial<User>): Observable<User | undefined> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers[index] = { ...this.mockUsers[index], ...user, updatedAt: new Date(), updatedBy: '1' };
      return of(this.mockUsers[index]).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  deleteUser(id: string): Observable<boolean> {
    const index = this.mockUsers.findIndex(u => u.userId === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
