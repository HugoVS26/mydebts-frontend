import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { HttpErrorResponse } from '@angular/common/http';

import { ResetPasswordPage } from './reset-password';
import { AuthService } from 'src/app/features/auth/services/auth';

const mockAuthService = {
  resetPassword: vi.fn(),
};

interface MockActivatedRoute {
  snapshot: {
    queryParamMap: {
      get: ReturnType<typeof vi.fn>;
    };
  };
}

const mockActivatedRoute = (token: string | null): MockActivatedRoute => ({
  snapshot: {
    queryParamMap: {
      get: vi.fn().mockReturnValue(token),
    },
  },
});

describe('Given a ResetPasswordPage component', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let router: Router;

  const setupComponent = async (token: string | null = 'valid-token'): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'login', component: ResetPasswordPage },
          { path: 'forgot-password', component: ResetPasswordPage },
        ]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(token) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('When the component is initialized with a valid token', () => {
    it('Should create', async () => {
      await setupComponent('valid-token');
      expect(component).toBeTruthy();
    });

    it('Should set the token signal', async () => {
      await setupComponent('valid-token');
      expect(component.token()).toBe('valid-token');
    });

    it('Should have null error message', async () => {
      await setupComponent('valid-token');
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When the component is initialized without a token', () => {
    it('Should navigate to /forgot-password', async () => {
      await setupComponent(null);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/forgot-password']);
    });

    it('Should not set the token signal', async () => {
      await setupComponent(null);
      expect(component.token()).toBeNull();
    });
  });

  describe('When onResetPassword is called successfully', () => {
    it('Should call authService resetPassword method with token and new password', async () => {
      await setupComponent('valid-token');
      mockAuthService.resetPassword.mockReturnValue(of({ message: 'success' }));

      component.onResetPassword('NewPassword123!');

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123!');
    });

    it('Should navigate to /login on success', async () => {
      await setupComponent('valid-token');
      const navigateSpy = vi.spyOn(router, 'navigate');
      mockAuthService.resetPassword.mockReturnValue(of({ message: 'success' }));

      component.onResetPassword('NewPassword123!');

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('Should clear error message before calling the service', async () => {
      await setupComponent('valid-token');
      component.errorMessage.set('Previous error');
      mockAuthService.resetPassword.mockReturnValue(of({ message: 'success' }));

      component.onResetPassword('NewPassword123!');

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When onResetPassword is called without a token', () => {
    it('Should not call authService resetPassword method', async () => {
      await setupComponent(null);

      component.onResetPassword('NewPassword123!');

      expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('When onResetPassword fails with a server error', () => {
    it('Should set a generic error message', async () => {
      const expectedMessage = 'Something went wrong. Please try again.';
      await setupComponent('valid-token');
      const error = { status: 500 } as HttpErrorResponse;
      mockAuthService.resetPassword.mockReturnValue(throwError(() => error));

      component.onResetPassword('NewPassword123!');

      expect(component.errorMessage()).toBe(expectedMessage);
    });

    it('Should set a connection error message when status is 0', async () => {
      const expectedMessage = 'Cannot connect to server. Please check your internet connection.';
      await setupComponent('valid-token');
      const error = { status: 0 } as HttpErrorResponse;
      mockAuthService.resetPassword.mockReturnValue(throwError(() => error));

      component.onResetPassword('NewPassword123!');

      expect(component.errorMessage()).toBe(expectedMessage);
    });

    it('Should set an expired token message when status is 400', async () => {
      const expectedMessage =
        'Your reset link is invalid or has expired. Please request a new one.';
      await setupComponent('valid-token');
      const error = { status: 400 } as HttpErrorResponse;
      mockAuthService.resetPassword.mockReturnValue(throwError(() => error));

      component.onResetPassword('NewPassword123!');

      expect(component.errorMessage()).toBe(expectedMessage);
    });

    it('Should not navigate on error', async () => {
      await setupComponent('valid-token');
      const navigateSpy = vi.spyOn(router, 'navigate');
      const error = { status: 500 } as HttpErrorResponse;
      mockAuthService.resetPassword.mockReturnValue(throwError(() => error));

      component.onResetPassword('NewPassword123!');

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
