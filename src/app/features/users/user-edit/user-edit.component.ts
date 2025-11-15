import { Component, ChangeDetectionStrategy, input, output, effect, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { CanComponentDeactivate } from '../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserEditComponent {
  user = input<User | null>(null);
  mode = input<'add' | 'edit'>('add');
  formSubmit = output<User>();
  cancel = output<void>();

  private fb = new FormBuilder();
  userForm: FormGroup;
  avatarPreview = signal<string | null>(null);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);

  constructor() {
    this.userForm = this.fb.group({
      userId: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: [''],
      phoneNumber: [''],
      password: [''],
      status: ['Active']
    });

    // Set password as required only for 'add' mode
    effect(() => {
      const currentMode = this.mode();
      const passwordControl = this.userForm.get('password');
      
      if (currentMode === 'add') {
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      } else {
        passwordControl?.clearValidators();
      }
      passwordControl?.updateValueAndValidity();
    });

    // Populate form when user input changes
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.userForm.patchValue({
          userId: currentUser.userId,
          username: currentUser.username,
          email: currentUser.email,
          firstName: currentUser.firstName,
          middleName: currentUser.middleName || '',
          lastName: currentUser.lastName || '',
          phoneNumber: currentUser.phoneNumber || '',
          status: currentUser.status
        });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const userData: User = {
        userId: formValue.userId || crypto.randomUUID(),
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        middleName: formValue.middleName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        status: formValue.status,
        createdAt: this.user()?.createdAt || new Date(),
        createdBy: this.user()?.createdBy || 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      this.formSubmit.emit(userData);
      // Show success toast
      this.notification.success('User saved', 'The user was saved successfully.');
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.notification.info('Cancelled', 'No changes were saved.');
  }

  /**
   * CanDeactivate hook used by the route guard. Shows a PrimeNG confirm dialog
   * if the form is dirty. Returns a Promise<boolean> that resolves according to
   * the user's choice.
   */
  canDeactivate(): Promise<boolean> | boolean {
    if (!this.userForm.dirty) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      this.confirmation.confirm({
        message: 'You have unsaved changes. Discard changes and leave?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Discard',
        rejectLabel: 'Stay',
        accept: () => {
          this.notification.warn('Discarded', 'Unsaved changes were discarded.');
          resolve(true);
        },
        reject: () => {
          this.notification.info('Continue Editing', 'Your changes are still here.');
          resolve(false);
        }
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: Event): void {
    // Prevent default to allow drop
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const dt = event.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      const file = dt.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Clear dataTransfer
      if (dt.items) {
        dt.items.clear();
      } else {
        dt.clearData();
      }
    }
    }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
