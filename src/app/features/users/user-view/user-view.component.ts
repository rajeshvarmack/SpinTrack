import { Component, ChangeDetectionStrategy, input, computed, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  userId = signal<string | null>(null);
  
  constructor() {
    // Get user ID from route parameters
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.userId.set(id);
    });
  }
  
  // Mock data for demonstration
  mockUsername = 'john.smith';
  mockEmail = 'john.smith@spintrack.com';
  mockFirstName = 'John';
  mockMiddleName = 'Michael';
  mockLastName = 'Smith';
  mockPhone = '+971 50 123 4567';
  mockDateOfBirth = '15/03/1990';
  mockGender = 'Male';
  mockNationalId = '784-1990-1234567-8';
  mockNationality = 'United Arab Emirates';
  mockCreatedAt = new Date('2024-01-15T10:30:00');
  mockCreatedBy = 'admin';
  mockUpdatedAt = new Date('2024-11-10T14:45:00');
  mockUpdatedBy = 'john.smith';
  
  fullName = computed(() => {
    const currentUser = this.user();
    if (currentUser) {
      const parts = [
        currentUser.firstName,
        currentUser.middleName,
        currentUser.lastName
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(' ');
    }
    return `${this.mockFirstName} ${this.mockMiddleName} ${this.mockLastName}`;
  });

  statusClass = computed(() => {
    const currentUser = this.user();
    return currentUser?.status === 'Active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  });

  goBack(): void {
    this.router.navigate(['/users']);
  }

  editUser(): void {
    const currentUser = this.user();
    const id = this.userId() || currentUser?.userId;
    if (id) {
      this.router.navigate(['/users', id, 'edit']);
    }
  }
}
