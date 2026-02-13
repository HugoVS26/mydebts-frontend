import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';

import { guestGuard } from './guest.guard';
import { AuthService } from '../../../features/auth/services/auth';

describe('Given a guestGuard', () => {
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

  describe('When user is not authenticated', () => {
    it('Should allow access', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('When user is authenticated', () => {
    it('Should redirect to debts page', () => {
      const mockUrlTree = { toString: (): string => '/debts' };
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

      const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/debts']);
      expect(result).toBe(mockUrlTree);
    });
  });
});
