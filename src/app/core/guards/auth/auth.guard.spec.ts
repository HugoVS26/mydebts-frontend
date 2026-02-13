import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from 'src/app/features/auth/services/auth';

describe('Given an authGuard', () => {
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn> };
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn> };
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = { isAuthenticated: vi.fn() };
    mockRouter = { createUrlTree: vi.fn() };
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        provideZonelessChangeDetection(),
      ],
    });
  });

  describe('When user is authenticated', () => {
    it('Should allow access', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('When user is not authenticated', () => {
    it('Should redirect to login', () => {
      const mockUrlTree = { toString: (): string => '/login' };
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
      expect(result).toBe(mockUrlTree);
    });
  });
});
