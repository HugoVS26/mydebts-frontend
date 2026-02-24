import type { OutputEmitterRef } from '@angular/core';
import { Component, inject, output, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './forgot-password-form.html',
  styleUrl: './forgot-password-form.scss',
})
export class ForgotPasswordForm {
  private formBuilder = inject(FormBuilder);

  submitForm: OutputEmitterRef<string> = output<string>();
  navigateToLogin: OutputEmitterRef<void> = output<void>();

  errorMessage = input<string | null>(null);

  forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.submitForm.emit(this.forgotPasswordForm.getRawValue().email);
    }
  }

  get email(): FormControl<string> {
    return this.forgotPasswordForm.controls.email;
  }
}
