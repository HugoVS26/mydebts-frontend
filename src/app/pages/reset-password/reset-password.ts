import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import type { HttpErrorResponse } from '@angular/common/http';

import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { ResetPasswordForm } from 'src/app/features/auth/components/reset-password-form/reset-password-form';
import { AuthService } from 'src/app/features/auth/services/auth';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ResetPasswordForm, PublicNavbar],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = signal<string | null>(null);
  token = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.token.set(token);
  }

  onResetPassword(newPassword: string): void {
    const token = this.token();

    if (!token) return;

    this.errorMessage.set(null);

    this.authService.resetPassword(token, newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Reset password failed:', error);

        let message = 'Something went wrong. Please try again.';

        if (error.status === 0) {
          message = 'Cannot connect to server. Please check your internet connection.';
        }

        if (error.status === 400) {
          message = 'Your reset link is invalid or has expired. Please request a new one.';
        }

        this.errorMessage.set(message);
      },
    });
  }
}
