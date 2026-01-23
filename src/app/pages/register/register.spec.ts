import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterPage } from './register';
import { DebtListPage } from '../debt-list/debt-list';
import { AuthService } from '../../features/auth/services/auth';
import { registerRequestMock, authResponseMock } from '../../features/auth/mocks/authMock';

describe('Given a RegisterPage component', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  const REGISTER_ROUTE = 'register';
  const DEBTS_ROUTE = '/debts';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([
          { path: REGISTER_ROUTE, component: RegisterPage },
          { path: 'debts', component: DebtListPage },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should have errorMessage as null', () => {
      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When registration is successful', () => {
    it('Should clear error message', () => {
      component.errorMessage.set('Previous error');
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'register').mockReturnValue(of(authResponseMock));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith([DEBTS_ROUTE]);
    });

    it('Should call authService register method with correct data', () => {
      const spy = vi.spyOn(authService, 'register').mockReturnValue(of(authResponseMock));

      component.onRegister(registerRequestMock);

      expect(spy).toHaveBeenCalledWith(registerRequestMock);
    });

    it('Should navigate to /debts', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'register').mockReturnValue(of(authResponseMock));

      component.onRegister(registerRequestMock);

      expect(navigateSpy).toHaveBeenCalledWith([DEBTS_ROUTE]);
    });

    it('Should not set error message', () => {
      vi.spyOn(authService, 'register').mockReturnValue(of(authResponseMock));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When registration fails with 409 (Conflict)', () => {
    it('Should set duplicate email error message', () => {
      const expectedErrorMessage =
        'This email is already registered. Please use a different email or try logging in.';
      const error = new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',
        error: { message: 'Email already exists' },
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should not navigate to /debts', () => {
      const error = new HttpErrorResponse({ status: 409 });
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('When registration fails with 400 (Bad Request)', () => {
    it('Should set custom error message from backend', () => {
      const expectedErrorMessage = 'Invalid email format';
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid email format' },
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should set default validation error when no message from backend', () => {
      const expectedErrorMessage = 'Invalid registration data. Please check your information.';
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When registration fails with 0 (Network Error)', () => {
    it('Should set network connection error message', () => {
      const expectedErrorMessage =
        'Cannot connect to server. Please check your internet connection.';
      const error = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When registration fails with 500 (Server Error)', () => {
    it('Should set generic error message', () => {
      const expectedErrorMessage = 'Registration failed. Please try again.';
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When registration fails with unknown error', () => {
    it('Should set generic error message', () => {
      const expectedErrorMessage = 'Registration failed. Please try again.';
      const error = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
      });
      vi.spyOn(authService, 'register').mockReturnValue(throwError(() => error));

      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When multiple registration attempts are made', () => {
    it('Should clear previous error before new attempt', () => {
      const error = new HttpErrorResponse({ status: 409 });
      vi.spyOn(authService, 'register').mockReturnValueOnce(throwError(() => error));

      component.onRegister(registerRequestMock);
      expect(component.errorMessage()).not.toBeNull();

      vi.spyOn(authService, 'register').mockReturnValueOnce(of(authResponseMock));
      component.onRegister(registerRequestMock);

      expect(component.errorMessage()).toBeNull();
    });

    it('Should handle consecutive failures with different errors', () => {
      const error1 = new HttpErrorResponse({ status: 409 });
      vi.spyOn(authService, 'register').mockReturnValueOnce(throwError(() => error1));
      component.onRegister(registerRequestMock);
      const firstError = component.errorMessage();

      const error2 = new HttpErrorResponse({ status: 400, error: {} });
      const expectedErrorMessage = 'Invalid registration data. Please check your information.';
      vi.spyOn(authService, 'register').mockReturnValueOnce(throwError(() => error2));
      component.onRegister(registerRequestMock);
      const secondError = component.errorMessage();

      expect(firstError).not.toBe(secondError);
      expect(secondError).toBe(expectedErrorMessage);
    });
  });
});
