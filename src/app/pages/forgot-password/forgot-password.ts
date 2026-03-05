import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { ForgotPasswordForm } from 'src/app/features/auth/components/forgot-password-form/forgot-password-form';
import { ForgotPasswordSuccess } from 'src/app/features/auth/components/forgot-password-success/forgot-password-success';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { ForgotPasswordSubmit } from 'src/app/features/auth/types/auth';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ForgotPasswordForm, ForgotPasswordSuccess, PublicNavbar],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild(ForgotPasswordForm) private forgotPasswordForm!: ForgotPasswordForm;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  onForgotPassword(data: ForgotPasswordSubmit): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService
      .forgotPassword(data.email, data.turnstileToken)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.submitted.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.forgotPasswordForm.resetTurnstile();
        },
      });
  }

  onNavigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  onTryAgain(): void {
    this.submitted.set(false);
    this.errorMessage.set(null);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0)
      return 'Cannot connect to server. Please check your internet connection.';
    return 'Something went wrong. Please try again.';
  }
}
