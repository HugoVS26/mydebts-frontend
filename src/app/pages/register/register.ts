import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import type { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';

import { RegisterForm } from 'src/app/features/auth/components/register-form/register-form';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { RegisterRequest } from 'src/app/features/auth/types/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-page',
  imports: [RegisterForm, PublicNavbar],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(RegisterForm) private registerForm!: RegisterForm;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onRegister(data: RegisterRequest): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService
      .register(data)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/debts']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.registerForm.resetTurnstile();
        },
      });
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 409)
      return 'This email is already registered. Please use a different email or try logging in.';
    if (error.status === 400)
      return error.error?.message || 'Invalid registration data. Please check your information.';
    if (error.status === 0)
      return 'Cannot connect to server. Please check your internet connection.';
    return 'Registration failed. Please try again.';
  }
}
