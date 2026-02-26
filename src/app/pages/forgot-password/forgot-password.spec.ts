import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { HttpErrorResponse } from '@angular/common/http';

import { ForgotPasswordPage } from './forgot-password';
import { AuthService } from 'src/app/features/auth/services/auth';
import type { ForgotPasswordSubmit } from 'src/app/features/auth/types/auth';

const mockAuthService = {
  forgotPassword: vi.fn(),
};

const mockSubmit: ForgotPasswordSubmit = {
  email: 'test@mail.dev',
  turnstileToken: 'mock-turnstile-token',
};

describe('Given a ForgotPasswordPage component', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should have null error message', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('Should have submitted as false', () => {
      expect(component.submitted()).toBeFalsy();
    });
  });

  describe('When onForgotPassword is called with a valid email', () => {
    it('Should call forgotPassword method with email and turnstile token', () => {
      mockAuthService.forgotPassword.mockReturnValue(of({ message: 'sent' }));

      component.onForgotPassword(mockSubmit);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        mockSubmit.email,
        mockSubmit.turnstileToken,
      );
    });

    it('Should set submitted to true on success', () => {
      mockAuthService.forgotPassword.mockReturnValue(of({ message: 'sent' }));

      component.onForgotPassword(mockSubmit);

      expect(component.submitted()).toBeTruthy();
    });

    it('Should clear error message before calling the service', () => {
      component.errorMessage.set('Previous error');
      mockAuthService.forgotPassword.mockReturnValue(of({ message: 'sent' }));

      component.onForgotPassword(mockSubmit);

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When onForgotPassword fails with a server error', () => {
    it('Should set a generic error message', () => {
      const error = { status: 500 } as HttpErrorResponse;
      mockAuthService.forgotPassword.mockReturnValue(throwError(() => error));

      component.onForgotPassword(mockSubmit);

      expect(component.errorMessage()).toBe('Something went wrong. Please try again.');
    });

    it('Should set a connection error message when status is 0', () => {
      const error = { status: 0 } as HttpErrorResponse;
      mockAuthService.forgotPassword.mockReturnValue(throwError(() => error));

      component.onForgotPassword(mockSubmit);

      expect(component.errorMessage()).toBe(
        'Cannot connect to server. Please check your internet connection.',
      );
    });

    it('Should not set submitted to true on error', () => {
      const error = { status: 500 } as HttpErrorResponse;
      mockAuthService.forgotPassword.mockReturnValue(throwError(() => error));

      component.onForgotPassword(mockSubmit);

      expect(component.submitted()).toBeFalsy();
    });
  });

  describe('When onNavigateToLogin is called', () => {
    it('Should navigate to /login', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onNavigateToLogin();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
