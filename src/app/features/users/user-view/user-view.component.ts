import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe]
})
export class UserViewComponent {
  user = input<User | null>(null);
  
  fullName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return 'Unknown User';
    const parts = [
      currentUser.firstName,
      currentUser.middleName,
      currentUser.lastName
    ].filter(Boolean);
    return parts.join(' ');
  });

  statusClass = computed(() => {
    const currentUser = this.user();
    return currentUser?.status === 'Active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  });
}
