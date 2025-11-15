import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { PrimeNgTableModule } from '../../../shared/modules/primeng-table.module';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, PrimeNgTableModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  
  users = signal<User[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  rowsPerPage = signal(10);
  tableScrollHeight = signal('400px');
  frozenCols: any[] = [];

  constructor() {
    // Calculate rows per page based on viewport height
    if (isPlatformBrowser(this.platformId)) {
      this.calculateRowsPerPage();
      window.addEventListener('resize', () => this.calculateRowsPerPage());
    }
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const usersArr = this.users() ?? [];
    if (!term) return usersArr;
    return usersArr.filter((user: User) =>
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  });

  allUsersCount = computed(() => (this.users() ?? []).length);
  activeUsersCount = computed(() => (this.users() ?? []).filter((u: User) => u.status === 'Active').length);
  inactiveUsersCount = computed(() => (this.users() ?? []).filter((u: User) => u.status === 'Inactive').length);

  private calculateRowsPerPage(): void {
    // Calculate based on ACTUAL viewport and measurements:
    // - Component padding (py-3): 12px top + 12px bottom = 24px
    // - Header section: 44px
    // - Search bar: 58px
    // - Status cards: 116px (with min-h-[100px])
    // - Spacing (mb-3 x 3): 36px
    // - Table chrome (header + pagination): 105px
    // Total fixed overhead: ~383px
    
    const componentPadding = 24;
    const headerHeight = 44;
    const searchHeight = 58;
    const cardsHeight = 116;
    const spacingTotal = 36;
    const tableChromeHeight = 105;
    
    const totalOverhead = componentPadding + headerHeight + searchHeight + cardsHeight + spacingTotal + tableChromeHeight;
    const availableHeight = window.innerHeight - totalOverhead;
    const rowHeight = 49;
    
    // Calculate maximum rows that fit in viewport
    const calculatedRows = Math.max(5, Math.floor(availableHeight / rowHeight));
    this.rowsPerPage.set(calculatedRows);
    
    // Set table body scroll height (just the rows, not including header/footer)
    const tableBodyHeight = calculatedRows * rowHeight;
    this.tableScrollHeight.set(`${Math.max(300, tableBodyHeight)}px`);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading.set(false);
      }
    });
  }

  searchUsers(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(userId: string): string {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-cyan-400 to-cyan-600',
      'from-indigo-400 to-indigo-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
      'from-violet-400 to-violet-600',
      'from-sky-400 to-sky-600'
    ];
    const index = parseInt(userId, 10) % colors.length;
    return colors[index];
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Active': return 'bg-success-100 text-success-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Suspended': return 'bg-danger-100 text-danger-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: (success) => {
          if (success) {
            this.loadUsers();
          }
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }
}
