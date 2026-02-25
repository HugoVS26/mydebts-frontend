import { Component, output } from '@angular/core';
import type { OutputEmitterRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password-success',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './forgot-password-success.html',
  styleUrls: ['./forgot-password-success.scss'],
})
export class ForgotPasswordSuccess {
  navigateToLogin: OutputEmitterRef<void> = output<void>();
  tryAgain: OutputEmitterRef<void> = output<void>();

  onNavigateToLogin(): void {
    this.navigateToLogin.emit();
  }

  onTryAgain(): void {
    this.tryAgain.emit();
  }
}
