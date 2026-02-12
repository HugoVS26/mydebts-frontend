import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { HttpErrorResponse } from '@angular/common/http';

import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { LoginForm } from 'src/app/features/auth/components/login-form/login-form';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { LoginRequest } from 'src/app/features/auth/types/auth';

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

  errorMessage = signal<string | null>(null);

  onLogin(data: LoginRequest): void {
    this.errorMessage.set(null);

    this.authService.login(data).subscribe({
      next: () => {
        this.router.navigate(['/debts']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Login failed:', error);

        let message = 'Login failed. Please try again.';

        if (error.status === 401) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.status === 400) {
          message = error.error?.message || 'Invalid login data. Please check your information.';
        } else if (error.status === 0) {
          message = 'Cannot connect to server. Please check your internet connection.';
        }

        this.errorMessage.set(message);
      },
    });
  }

  onNavigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
