import type { OutputEmitterRef } from '@angular/core';
import { Component, inject, output, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxTurnstileModule } from 'ngx-turnstile';

import { environment } from 'src/environments/environment';
import type { ForgotPasswordSubmit } from '../../types/auth';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgxTurnstileModule,
  ],
  templateUrl: './forgot-password-form.html',
  styleUrl: './forgot-password-form.scss',
})
export class ForgotPasswordForm {
  private formBuilder = inject(FormBuilder);

  submitForm: OutputEmitterRef<ForgotPasswordSubmit> = output<ForgotPasswordSubmit>();
  navigateToLogin: OutputEmitterRef<void> = output<void>();
  errorMessage = input<string | null>(null);
  turnstileToken = signal<string | null>(null);
  siteKey = environment.turnstileSiteKey;

  forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && this.turnstileToken()) {
      this.submitForm.emit({
        email: this.forgotPasswordForm.getRawValue().email,
        turnstileToken: this.turnstileToken()!,
      });
    }
  }

  onTurnstileResolved(token: string | null): void {
    this.turnstileToken.set(token);
  }

  onTurnstileExpired(): void {
    this.turnstileToken.set(null);
  }

  get email(): FormControl<string> {
    return this.forgotPasswordForm.controls.email;
  }
}
