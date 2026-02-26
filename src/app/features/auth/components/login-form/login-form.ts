import type { OutputEmitterRef } from '@angular/core';
import { Component, inject, output, signal, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgxTurnstileModule } from 'ngx-turnstile';

import { environment } from 'src/environments/environment';
import type { LoginRequest } from '../../types/auth';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    NgxTurnstileModule,
  ],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss'],
})
export class LoginForm {
  formBuilder = inject(FormBuilder);
  submitForm: OutputEmitterRef<LoginRequest> = output<LoginRequest>();
  navigateToRegister: OutputEmitterRef<void> = output<void>();
  errorMessage = input<string | null>(null);
  hide = signal(true);
  turnstileToken = signal<string | null>(null);
  siteKey = environment.turnstileSiteKey;

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid && this.turnstileToken()) {
      this.submitForm.emit({
        ...this.loginForm.getRawValue(),
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

  clickEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hide.update((value) => !value);
  }

  onNavigateToLogin(): void {
    this.navigateToRegister.emit();
  }

  get email(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  get password(): FormControl<string> {
    return this.loginForm.controls.password;
  }
}
