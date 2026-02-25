import type { OutputEmitterRef } from '@angular/core';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { passwordComplexityValidator } from '../../validators/password-complexity.validator';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './reset-password-form.html',
  styleUrls: ['./reset-password-form.scss'],
})
export class ResetPasswordForm {
  private formBuilder = inject(FormBuilder);

  submitForm: OutputEmitterRef<string> = output<string>();
  errorMessage = input<string | null>(null);

  hide = signal(true);

  resetPasswordForm = this.formBuilder.nonNullable.group({
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

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.submitForm.emit(this.resetPasswordForm.getRawValue().password);
    }
  }

  clickEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hide.update((value) => !value);
  }

  get password(): FormControl<string> {
    return this.resetPasswordForm.controls.password;
  }

  get confirmPassword(): FormControl<string> {
    return this.resetPasswordForm.controls.confirmPassword;
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.password.value);
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.password.value);
  }

  hasDigit(): boolean {
    return /\d/.test(this.password.value);
  }

  hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.password.value);
  }

  hasMinLength(): boolean {
    return this.password.value.length >= 8;
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
    const { password, confirmPassword } = this.resetPasswordForm.getRawValue();
    return password === confirmPassword && confirmPassword.length > 0;
  }
}
