import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Navbar } from 'src/app/shared/components/navbar/navbar';
import { RegisterForm } from 'src/app/features/auth/components/register-form/register-form';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { RegisterRequest } from 'src/app/features/auth/types/auth';

@Component({
  selector: 'app-register-page',
  imports: [RegisterForm, Navbar],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);

  onRegister(data: RegisterRequest): void {
    this.errorMessage.set(null);

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/debts']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration failed:', error);

        let message = 'Registration failed. Please try again.';

        if (error.status === 409) {
          message =
            'This email is already registered. Please use a different email or try logging in.';
        } else if (error.status === 400) {
          message =
            error.error?.message || 'Invalid registration data. Please check your information.';
        } else if (error.status === 0) {
          message = 'Cannot connect to server. Please check your internet connection.';
        }

        this.errorMessage.set(message);
      },
    });
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
