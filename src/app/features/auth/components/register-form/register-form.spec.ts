import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import type { RegisterRequest } from '../../types/auth';
import { RegisterForm } from './register-form';

describe('Given a RegisterForm component', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component it is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('Should have all fields empty initially', () => {
      expect(component.firstName.value).toBe('');
      expect(component.lastName.value).toBe('');
      expect(component.email.value).toBe('');
      expect(component.password.value).toBe('');
      expect(component.confirmPassword.value).toBe('');
    });

    it('Should have passwords hidden by default', () => {
      expect(component.hide()).toBeTruthy();
    });
  });

  describe('When firstName is being validated', () => {
    it('Should be required', () => {
      component.firstName.setValue('');
      expect(component.firstName.hasError('required')).toBeTruthy();
    });

    it('Should have minimum length of 1', () => {
      component.firstName.setValue('');
      expect(component.firstName.hasError('minlength')).toBeFalsy();
      component.firstName.setValue('H');
      expect(component.firstName.valid).toBeTruthy();
    });

    it('Should have maximum length of 20', () => {
      component.firstName.setValue('A'.repeat(21));
      expect(component.firstName.hasError('maxlength')).toBeTruthy();
    });

    it('Should be valid with proper value', () => {
      component.firstName.setValue('José');
      expect(component.firstName.valid).toBeTruthy();
    });
  });

  describe('When lastName is being validated', () => {
    it('Should be required', () => {
      component.lastName.setValue('');
      expect(component.lastName.hasError('required')).toBeTruthy();
    });

    it('Should have minimum length of 1', () => {
      component.lastName.setValue('G');
      expect(component.lastName.valid).toBeTruthy();
    });

    it('Should have maximum length of 20', () => {
      component.lastName.setValue('A'.repeat(21));
      expect(component.lastName.hasError('maxlength')).toBeTruthy();
    });

    it('Should be valid with proper value', () => {
      component.lastName.setValue('García');
      expect(component.lastName.valid).toBeTruthy();
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

    it('Should accept valid email format', () => {
      component.email.setValue('hugo@example.com');
      expect(component.email.valid).toBeTruthy();
    });

    it('Should have maximum length of 254', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      component.email.setValue(longEmail);
      expect(component.email.hasError('maxlength')).toBeTruthy();
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

    it('Should require lowercase letter', () => {
      component.password.setValue('PASSWORD123!');
      expect(component.password.hasError('passwordComplexity')).toBeTruthy();
      expect(component.hasLowercase()).toBeFalsy();
    });

    it('Should require uppercase letter', () => {
      component.password.setValue('password123!');
      expect(component.password.hasError('passwordComplexity')).toBeTruthy();
      expect(component.hasUppercase()).toBeFalsy();
    });

    it('Should require a digit', () => {
      component.password.setValue('Password!');
      expect(component.password.hasError('passwordComplexity')).toBeTruthy();
      expect(component.hasDigit()).toBeFalsy();
    });

    it('Should require a special character', () => {
      component.password.setValue('Password123');
      expect(component.password.hasError('passwordComplexity')).toBeTruthy();
      expect(component.hasSpecialChar()).toBeFalsy();
    });

    it('Should be valid with all requirements met', () => {
      component.password.setValue('Password123!');
      expect(component.password.valid).toBeTruthy();
      expect(component.hasLowercase()).toBeTruthy();
      expect(component.hasUppercase()).toBeTruthy();
      expect(component.hasDigit()).toBeTruthy();
      expect(component.hasSpecialChar()).toBeTruthy();
      expect(component.hasMinLength()).toBeTruthy();
    });
  });

  describe('When the password is being typed and the password requirement checkers are triggered', () => {
    it('Should return true when password has lowercase', () => {
      component.password.setValue('Password123!');
      expect(component.hasLowercase()).toBeTruthy();
    });

    it('Sshould return false when password has no lowercase', () => {
      component.password.setValue('PASSWORD123!');
      expect(component.hasLowercase()).toBeFalsy();
    });

    it('Should return true when password has uppercase', () => {
      component.password.setValue('Password123!');
      expect(component.hasUppercase()).toBeTruthy();
    });

    it('Should return false when password has no uppercase', () => {
      component.password.setValue('password123!');
      expect(component.hasUppercase()).toBeFalsy();
    });

    it('Should return true when password has digit', () => {
      component.password.setValue('Password123!');
      expect(component.hasDigit()).toBeTruthy();
    });

    it('Should return false when password has no digit', () => {
      component.password.setValue('Password!');
      expect(component.hasDigit()).toBeFalsy();
    });

    it('Should return true when password has special char', () => {
      component.password.setValue('Password123!');
      expect(component.hasSpecialChar()).toBeTruthy();
    });

    it('Should return false when password has no special char', () => {
      component.password.setValue('Password123');
      expect(component.hasSpecialChar()).toBeFalsy();
    });

    it('Should return true when password is 8+ chars', () => {
      component.password.setValue('Password1!');
      expect(component.hasMinLength()).toBeTruthy();
    });

    it('Should return false when password is less than 8 chars', () => {
      component.password.setValue('Pass1!');
      expect(component.hasMinLength()).toBeFalsy();
    });

    it('Should return true when requirements are not met', () => {
      component.password.setValue('password');
      expect(component.hasUnmetRequirements()).toBeTruthy();
    });

    it('Should return false when all requirements are met', () => {
      component.password.setValue('Password123!');
      expect(component.hasUnmetRequirements()).toBeFalsy();
    });
  });

  describe('When confirmPassword is being validated', () => {
    it('Should be required', () => {
      component.confirmPassword.setValue('');
      expect(component.confirmPassword.hasError('required')).toBeTruthy();
    });

    it('Should require to match password exactly', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');
      expect(component.confirmPassword.hasError('passwordMismatch')).toBeFalsy();
    });

    it('Should show error when not matching exactly', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('DifferentPass1!');
      expect(component.confirmPassword.hasError('passwordMismatch')).toBeTruthy();
    });

    it('Should return true when passwords match', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');
      expect(component.passwordsMatch()).toBeTruthy();
    });

    it('Should return false when passwords do not match exactly', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Different123!');
      expect(component.passwordsMatch()).toBeFalsy();
    });

    it('Should return false when confirmPassword is empty', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('');
      expect(component.passwordsMatch()).toBeFalsy();
    });

    it('Should revalidate confirmPassword when changing password', () => {
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');
      expect(component.confirmPassword.hasError('passwordMismatch')).toBeFalsy();

      component.password.setValue('NewPassword123!');
      expect(component.confirmPassword.hasError('passwordMismatch')).toBeTruthy();
    });
  });

  describe('When we want to submit the form', () => {
    it('Should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('Should be valid with all required fields filled correctly', () => {
      component.firstName.setValue('Hugo');
      component.lastName.setValue('García');
      component.email.setValue('hugo@example.com');
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');

      expect(component.registerForm.valid).toBeTruthy();
    });

    it('Should emit form data when valid', () => {
      const formData = {
        firstName: 'Hugo',
        lastName: 'García',
        email: 'hugo@example.com',
        password: 'Password123!',
      };

      component.firstName.setValue(formData.firstName);
      component.lastName.setValue(formData.lastName);
      component.email.setValue(formData.email);
      component.password.setValue(formData.password);
      component.confirmPassword.setValue(formData.password);

      let emittedData: RegisterRequest | undefined;
      component.submitForm.subscribe((data) => {
        emittedData = data;
      });

      component.onSubmit();

      expect(emittedData).toEqual(formData);
    });

    it('Should not emit when form is invalid', () => {
      let emitted = false;
      component.submitForm.subscribe(() => {
        emitted = true;
      });

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should exclude confirmPassword from emitted data', () => {
      component.firstName.setValue('Hugo');
      component.lastName.setValue('García');
      component.email.setValue('hugo@example.com');
      component.password.setValue('Password123!');
      component.confirmPassword.setValue('Password123!');

      let emittedData: RegisterRequest | undefined;
      component.submitForm.subscribe((data) => {
        emittedData = data;
      });

      component.onSubmit();

      expect(emittedData).not.toHaveProperty('confirmPassword');
    });
  });

  describe('When the password visibility button is toggled', () => {
    it('Should toggle hide signal', () => {
      const initialState = component.hide();
      const mockEvent = new MouseEvent('click');

      component.clickEvent(mockEvent);

      expect(component.hide()).toBe(!initialState);
    });

    it('Should call preventDefault', () => {
      const mockEvent = new MouseEvent('click');
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      component.clickEvent(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('When the error message input is loaded', () => {
    it('Should be null by default', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('Should accept input value', () => {
      fixture.componentRef.setInput('errorMessage', 'Test error message');
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Test error message');
    });
  });
});
