import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ForgotPasswordForm } from './forgot-password-form';
import type { ForgotPasswordSubmit } from '../../types/auth';

describe('Given a ForgotPasswordForm component', () => {
  let component: ForgotPasswordForm;
  let fixture: ComponentFixture<ForgotPasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordForm],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should be invalid when empty', () => {
      expect(component.forgotPasswordForm.valid).toBeFalsy();
    });

    it('Should have empty email field initially', () => {
      expect(component.email.value).toBe('');
    });

    it('Should have null error message by default', () => {
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When email is being validated', () => {
    it('Should be required', () => {
      component.email.setValue('');
      expect(component.email.hasError('required')).toBeTruthy();
    });

    it('Should have valid format', () => {
      component.email.setValue('invalid-email');
      expect(component.email.hasError('email')).toBeTruthy();
    });

    it('Should enforce maximum length of 254 characters', () => {
      component.email.setValue('a'.repeat(250) + '@example.com');
      expect(component.email.hasError('maxlength')).toBeTruthy();
    });

    it('Should accept valid email', () => {
      component.email.setValue('hugo@example.com');
      expect(component.email.valid).toBeTruthy();
    });
  });

  describe('When submitting the form', () => {
    beforeEach(() => {
      component.turnstileToken.set('mock-turnstile-token');
    });

    it('Should not emit when form is invalid', () => {
      let emitted = false;
      component.submitForm.subscribe(() => (emitted = true));

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should not emit when turnstile token is missing', () => {
      component.turnstileToken.set(null);
      component.email.setValue('hugo@example.com');

      let emitted = false;
      component.submitForm.subscribe(() => (emitted = true));

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should emit email and turnstile token when form is valid', () => {
      const expectedEmail = 'hugo@example.com';
      component.email.setValue(expectedEmail);

      let emittedData: ForgotPasswordSubmit | undefined;
      component.submitForm.subscribe((data) => (emittedData = data));

      component.onSubmit();

      expect(emittedData).toEqual({
        email: expectedEmail,
        turnstileToken: 'mock-turnstile-token',
      });
    });

    it('Should not emit when email is invalid format', () => {
      component.email.setValue('invalid-email');

      let emitted = false;
      component.submitForm.subscribe(() => (emitted = true));

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });
  });

  describe('When receiving error message input', () => {
    it('Should accept error message from parent', () => {
      fixture.componentRef.setInput('errorMessage', 'Something went wrong');
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Something went wrong');
    });

    it('Should reset to null when error is cleared', () => {
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();

      fixture.componentRef.setInput('errorMessage', null);
      fixture.detectChanges();

      expect(component.errorMessage()).toBeNull();
    });
  });
});
