import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ResetPasswordForm } from './reset-password-form';

describe('Given a ResetPasswordForm component', () => {
  let component: ResetPasswordForm;
  let fixture: ComponentFixture<ResetPasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordForm],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should be invalid when empty', () => {
      expect(component.resetPasswordForm.valid).toBeFalsy();
    });

    it('Should have empty fields initially', () => {
      expect(component.password.value).toBe('');
      expect(component.confirmPassword.value).toBe('');
    });

    it('Should have password hidden by default', () => {
      expect(component.hide()).toBeTruthy();
    });

    it('Should have null error message by default', () => {
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When password is being validated', () => {
    it('Should be required', () => {
      component.password.setValue('');
      expect(component.password.hasError('required')).toBeTruthy();
    });

    it('Should have minimum length of 8', () => {
      component.password.setValue('Pass1!');
      expect(component.password.hasError('minlength')).toBeTruthy();
    });

    it('Should have maximum length of 128', () => {
      component.password.setValue('P'.repeat(129) + '1!');
      expect(component.password.hasError('maxlength')).toBeTruthy();
    });

    it('Should enforce password complexity', () => {
      component.password.setValue('alllowercase1!');
      expect(component.password.hasError('passwordComplexity')).toBeTruthy();
    });

    it('Should accept valid password', () => {
      component.password.setValue('Password123!');
      expect(component.password.valid).toBeTruthy();
    });
  });

  describe('When confirm password is being validated', () => {
    it('Should be required', () => {
      component.confirmPassword.setValue('');
      expect(component.confirmPassword.hasError('required')).toBeTruthy();
    });

    it('Should fail when passwords do not match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Different123!');
      expect(component.confirmPassword.hasError('passwordMismatch')).toBeTruthy();
    });

    it('Should pass when passwords match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');
      expect(component.confirmPassword.valid).toBeTruthy();
    });
  });

  describe('When the password visibility button is toggled', () => {
    it('Should toggle hide signal', () => {
      const initialState = component.hide();
      component.clickEvent(new MouseEvent('click'));
      expect(component.hide()).toBe(!initialState);
    });

    it('Should call preventDefault', () => {
      const mockEvent = new MouseEvent('click');
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');
      component.clickEvent(mockEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('When submitting the form', () => {
    it('Should not emit when form is invalid', () => {
      let emitted = false;
      component.submitForm.subscribe(() => (emitted = true));

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should emit the password when form is valid', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');

      let emittedPassword: string | undefined;
      component.submitForm.subscribe((password) => (emittedPassword = password));

      component.onSubmit();

      expect(emittedPassword).toBe('Password123!');
    });

    it('Should not emit when passwords do not match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Different123!');

      let emitted = false;
      component.submitForm.subscribe(() => (emitted = true));

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });
  });

  describe('When password complexity helpers are called', () => {
    it('Should detect lowercase', () => {
      component.password.setValue('a');
      expect(component.hasLowercase()).toBeTruthy();
    });

    it('Should detect uppercase', () => {
      component.password.setValue('A');
      expect(component.hasUppercase()).toBeTruthy();
    });

    it('Should detect digit', () => {
      component.password.setValue('1');
      expect(component.hasDigit()).toBeTruthy();
    });

    it('Should detect special character', () => {
      component.password.setValue('!');
      expect(component.hasSpecialChar()).toBeTruthy();
    });

    it('Should detect minimum length', () => {
      component.password.setValue('12345678');
      expect(component.hasMinLength()).toBeTruthy();
    });

    it('Should return true for hasUnmetRequirements when password is weak', () => {
      component.password.setValue('weak');
      expect(component.hasUnmetRequirements()).toBeTruthy();
    });

    it('Should return false for hasUnmetRequirements when password is strong', () => {
      component.password.setValue('Password123!');
      expect(component.hasUnmetRequirements()).toBeFalsy();
    });
  });

  describe('When receiving error message input', () => {
    it('Should accept error message from parent', () => {
      fixture.componentRef.setInput('errorMessage', 'Invalid or expired token');
      fixture.detectChanges();
      expect(component.errorMessage()).toBe('Invalid or expired token');
    });

    it('Should reset to null when error is cleared', () => {
      fixture.componentRef.setInput('errorMessage', 'Error');
      fixture.detectChanges();

      fixture.componentRef.setInput('errorMessage', null);
      fixture.detectChanges();

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When passwordsMatch helper is called', () => {
    it('Should return false when passwords do not match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Different123!');
      expect(component.passwordsMatch()).toBeFalsy();
    });

    it('Should return true when passwords match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');
      expect(component.passwordsMatch()).toBeTruthy();
    });

    it('Should return false when confirm password is empty', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('');
      expect(component.passwordsMatch()).toBeFalsy();
    });
  });
});
