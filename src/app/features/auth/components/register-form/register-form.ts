import type { OutputEmitterRef } from '@angular/core';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxTurnstileModule } from 'ngx-turnstile';

import { environment } from 'src/environments/environment';
import type { RegisterRequest } from '../../types/auth';
import { passwordComplexityValidator } from '../../validators/password-complexity.validator';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Component({
  selector: 'app-register-form',
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
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.scss'],
})
export class RegisterForm {
  private formBuilder = inject(FormBuilder);

  submitForm: OutputEmitterRef<RegisterRequest> = output<RegisterRequest>();
  navigateToLogin: OutputEmitterRef<void> = output<void>();
  errorMessage = input<string | null>(null);
  hide = signal(true);
  turnstileToken = signal<string | null>(null);
  siteKey = environment.turnstileSiteKey;

  registerForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(128),
      passwordComplexityValidator(),
    ]),
    confirmPassword: this.formBuilder.nonNullable.control('', [
      Validators.required,
      passwordMatchValidator('password'),
    ]),
  });

  constructor() {
    this.password.valueChanges.subscribe(() => {
      if (this.confirmPassword.value) {
        this.confirmPassword.updateValueAndValidity();
      }
    });
  }

  clickEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hide.update((value) => !value);
  }

  onNavigateToLogin(): void {
    this.navigateToLogin.emit();
  }

  get firstName(): FormControl<string> {
    return this.registerForm.controls.firstName;
  }

  get lastName(): FormControl<string> {
    return this.registerForm.controls.lastName;
  }

  get email(): FormControl<string> {
    return this.registerForm.controls.email;
  }

  get password(): FormControl<string> {
    return this.registerForm.controls.password;
  }

  get confirmPassword(): FormControl<string> {
    return this.registerForm.controls.confirmPassword;
  }

  hasLowercase(): boolean {
    const value = this.password.value;
    return /[a-z]/.test(value);
  }

  hasUppercase(): boolean {
    const value = this.password.value;
    return /[A-Z]/.test(value);
  }

  hasDigit(): boolean {
    const value = this.password.value;
    return /\d/.test(value);
  }

  hasSpecialChar(): boolean {
    const value = this.password.value;
    return /[^A-Za-z0-9]/.test(value);
  }

  hasMinLength(): boolean {
    const value = this.password.value;
    return value.length >= 8;
  }

  hasUnmetRequirements(): boolean {
    return (
      !this.hasLowercase() ||
      !this.hasUppercase() ||
      !this.hasDigit() ||
      !this.hasSpecialChar() ||
      !this.hasMinLength()
    );
  }

  passwordsMatch(): boolean {
    const password = this.password.value;
    const confirmPassword = this.confirmPassword.value;
    return password === confirmPassword && confirmPassword.length > 0;
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.turnstileToken()) {
      const formValue = this.registerForm.getRawValue();
      const registerData: RegisterRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        turnstileToken: this.turnstileToken()!,
      };
      this.submitForm.emit(registerData);
    }
  }

  onTurnstileResolved(token: string | null): void {
    this.turnstileToken.set(token);
  }

  onTurnstileExpired(): void {
    this.turnstileToken.set(null);
  }
}
