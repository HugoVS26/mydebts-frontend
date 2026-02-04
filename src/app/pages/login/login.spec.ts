import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginPage } from './login';
import { DebtListPage } from '../debt-list/debt-list';
import { AuthService } from '../../features/auth/services/auth';
import { loginRequestMock, authResponseMock } from '../../features/auth/mocks/authMock';

describe('Given a LoginPage component', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  const LOGIN_ROUTE = 'login';
  const DEBTS_ROUTE = '/debts';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([
          { path: LOGIN_ROUTE, component: LoginPage },
          { path: 'debts', component: DebtListPage },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
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

  describe('When login is successful', () => {
    it('Should clear error message', () => {
      component.errorMessage.set('Previous error');
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'login').mockReturnValue(of(authResponseMock));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith([DEBTS_ROUTE]);
    });

    it('Should call authService login method with correct data', () => {
      const spy = vi.spyOn(authService, 'login').mockReturnValue(of(authResponseMock));

      component.onLogin(loginRequestMock);

      expect(spy).toHaveBeenCalledWith(loginRequestMock);
    });

    it('Should navigate to /debts', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'login').mockReturnValue(of(authResponseMock));

      component.onLogin(loginRequestMock);

      expect(navigateSpy).toHaveBeenCalledWith([DEBTS_ROUTE]);
    });

    it('Should not set error message', () => {
      vi.spyOn(authService, 'login').mockReturnValue(of(authResponseMock));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('When login fails with 401 (Unauthorized)', () => {
    it('Should set invalid credentials error message', () => {
      const expectedErrorMessage = 'Invalid email or password. Please try again.';
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Invalid credentials' },
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should not navigate to /debts', () => {
      const error = new HttpErrorResponse({ status: 401 });
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('When login fails with 400 (Bad Request)', () => {
    it('Should set custom error message from backend', () => {
      const expectedErrorMessage = 'Email is required';
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Email is required' },
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should set default validation error when no message from backend', () => {
      const expectedErrorMessage = 'Invalid login data. Please check your information.';
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {},
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When login fails with 0 (Network Error)', () => {
    it('Should set network connection error message', () => {
      const expectedErrorMessage =
        'Cannot connect to server. Please check your internet connection.';
      const error = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When login fails with 500 (Server Error)', () => {
    it('Should set generic error message', () => {
      const expectedErrorMessage = 'Login failed. Please try again.';
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When login fails with unknown error', () => {
    it('Should set generic error message', () => {
      const expectedErrorMessage = 'Login failed. Please try again.';
      const error = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When multiple login attempts are made', () => {
    it('Should clear previous error before new attempt', () => {
      const error = new HttpErrorResponse({ status: 401 });
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error));

      component.onLogin(loginRequestMock);
      expect(component.errorMessage()).not.toBeNull();

      vi.spyOn(authService, 'login').mockReturnValueOnce(of(authResponseMock));
      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBeNull();
    });

    it('Should handle consecutive failures with different errors', () => {
      const error1 = new HttpErrorResponse({ status: 401 });
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error1));
      component.onLogin(loginRequestMock);
      const firstError = component.errorMessage();

      const error2 = new HttpErrorResponse({ status: 400, error: {} });
      const expectedErrorMessage = 'Invalid login data. Please check your information.';
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error2));
      component.onLogin(loginRequestMock);
      const secondError = component.errorMessage();

      expect(firstError).not.toBe(secondError);
      expect(secondError).toBe(expectedErrorMessage);
    });
  });

  describe('When handling different error scenarios', () => {
    it('Should handle 401 error consistently', () => {
      const expectedErrorMessage = 'Invalid email or password. Please try again.';
      const error = new HttpErrorResponse({
        status: 401,
        error: { message: 'Token expired' },
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should prioritize backend error message for 400', () => {
      const expectedErrorMessage = 'Password cannot be empty';
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: expectedErrorMessage },
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });

    it('Should handle network timeout as network error', () => {
      const expectedErrorMessage =
        'Cannot connect to server. Please check your internet connection.';
      const error = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: new ProgressEvent('timeout'),
      });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).toBe(expectedErrorMessage);
    });
  });

  describe('When testing error message lifecycle', () => {
    it('Should start with null error message', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('Should set error message after failed login', () => {
      const error = new HttpErrorResponse({ status: 401 });
      vi.spyOn(authService, 'login').mockReturnValue(throwError(() => error));

      component.onLogin(loginRequestMock);

      expect(component.errorMessage()).not.toBeNull();
    });

    it('Should clear error message on successful login after failure', () => {
      const error = new HttpErrorResponse({ status: 401 });
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error));
      component.onLogin(loginRequestMock);
      expect(component.errorMessage()).not.toBeNull();

      vi.spyOn(authService, 'login').mockReturnValueOnce(of(authResponseMock));
      component.onLogin(loginRequestMock);
      expect(component.errorMessage()).toBeNull();
    });

    it('Should update error message on consecutive failures', () => {
      const error1 = new HttpErrorResponse({ status: 500 });
      const expectedErrorMessage1 = 'Login failed. Please try again.';
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error1));
      component.onLogin(loginRequestMock);
      const firstError = component.errorMessage();

      const error2 = new HttpErrorResponse({ status: 401 });
      const expectedErrorMessage2 = 'Invalid email or password. Please try again.';
      vi.spyOn(authService, 'login').mockReturnValueOnce(throwError(() => error2));
      component.onLogin(loginRequestMock);
      const secondError = component.errorMessage();

      expect(firstError).toBe(expectedErrorMessage1);
      expect(secondError).toBe(expectedErrorMessage2);
    });
  });
});
