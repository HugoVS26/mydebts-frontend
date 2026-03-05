import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { HttpErrorResponse } from '@angular/common/http';

import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { LoginForm } from 'src/app/features/auth/components/login-form/login-form';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { LoginRequest } from 'src/app/features/auth/types/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [LoginForm, PublicNavbar],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(LoginForm) private loginForm!: LoginForm;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin(data: LoginRequest): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService
      .login(data)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/debts']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.loginForm.resetTurnstile();
        },
      });
  }

  onNavigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Invalid email or password. Please try again.';
    if (error.status === 400)
      return error.error?.message || 'Invalid login data. Please check your information.';
    if (error.status === 0)
      return 'Cannot connect to server. Please check your internet connection.';
    return 'Login failed. Please try again.';
  }
}
