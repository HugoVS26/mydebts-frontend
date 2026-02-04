import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoginForm } from './login-form';
import type { LoginRequest } from '../../types/auth';

describe('Given a LoginForm component', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('Should have all empty fields initially', () => {
      expect(component.email.value).toBe('');
      expect(component.password.value).toBe('');
    });

    it('Should have password hidden by default', () => {
      expect(component.hide()).toBeTruthy();
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

    it('Should enforce maximum length of 254 characters', () => {
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

    it('Should accept valid password', () => {
      component.password.setValue('Password123!');
      expect(component.password.valid).toBeTruthy();
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

    it('Should toggle from hidden to visible', () => {
      expect(component.hide()).toBeTruthy();

      component.clickEvent(new MouseEvent('click'));

      expect(component.hide()).toBeFalsy();
    });

    it('Should toggle from visible to hidden', () => {
      component.hide.set(false);

      component.clickEvent(new MouseEvent('click'));

      expect(component.hide()).toBeTruthy();
    });
  });

  describe('When submitting the form', () => {
    it('Should be invalid when form is empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('Should be valid with all required fields filled correctly', () => {
      component.email.setValue('hugo@example.com');
      component.password.setValue('Password123!');

      expect(component.loginForm.valid).toBeTruthy();
    });

    it('Should emit form data when valid', () => {
      const loginData: LoginRequest = {
        email: 'hugo@example.com',
        password: 'Password123!',
      };

      component.email.setValue(loginData.email);
      component.password.setValue(loginData.password);

      let emittedData: LoginRequest | undefined;
      component.submitForm.subscribe((data) => {
        emittedData = data;
      });

      component.onSubmit();

      expect(emittedData).toEqual(loginData);
    });

    it('Should not emit when form is invalid', () => {
      let emitted = false;
      component.submitForm.subscribe(() => {
        emitted = true;
      });

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should not emit when only email is filled', () => {
      component.email.setValue('hugo@example.com');

      let emitted = false;
      component.submitForm.subscribe(() => {
        emitted = true;
      });

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });

    it('Should not emit when only password is filled', () => {
      component.password.setValue('Password123!');

      let emitted = false;
      component.submitForm.subscribe(() => {
        emitted = true;
      });

      component.onSubmit();

      expect(emitted).toBeFalsy();
    });
  });

  describe('When receiving error message input', () => {
    it('Should have null as default error message', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('Should accept error message from parent', () => {
      fixture.componentRef.setInput('errorMessage', 'Invalid credentials');
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('Should update when error message changes', () => {
      fixture.componentRef.setInput('errorMessage', 'First error');
      fixture.detectChanges();
      expect(component.errorMessage()).toBe('First error');

      fixture.componentRef.setInput('errorMessage', 'Second error');
      fixture.detectChanges();
      expect(component.errorMessage()).toBe('Second error');
    });

    it('Should reset to null when error is cleared', () => {
      fixture.componentRef.setInput('errorMessage', 'Error message');
      fixture.detectChanges();
      expect(component.errorMessage()).toBe('Error message');

      fixture.componentRef.setInput('errorMessage', null);
      fixture.detectChanges();
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When testing form validation combinations', () => {
    it('Should be invalid with valid email but short password', () => {
      component.email.setValue('hugo@example.com');
      component.password.setValue('Pass1!');

      expect(component.loginForm.invalid).toBeTruthy();
    });

    it('Should be invalid with invalid email but valid password', () => {
      component.email.setValue('invalid-email');
      component.password.setValue('Password123!');

      expect(component.loginForm.invalid).toBeTruthy();
    });

    it('Should be valid with minimum valid values', () => {
      component.email.setValue('a@b.c');
      component.password.setValue('12345678');

      expect(component.loginForm.valid).toBeTruthy();
    });
  });
});
