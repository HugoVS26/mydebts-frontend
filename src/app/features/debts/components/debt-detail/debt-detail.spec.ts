import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import type { ComponentFixture } from '@angular/core/testing';
import type { Observable } from 'rxjs';

import { DebtDetail } from './debt-detail';
import { DebtsService } from '../../services/debts';
import { AuthService } from '../../../auth/services/auth';
import { debtsMock, currentUserMock } from '../../mocks/debtsMock';
import type { IDebt } from '../../types/debt';
import type { User } from '../../../auth/types/user';

registerLocaleData(localeEs);

describe('Given a DebtDetail component', () => {
  let component: DebtDetail;
  let fixture: ComponentFixture<DebtDetail>;
  let debtsService: {
    deleteDebt: ReturnType<typeof vi.fn>;
    markDebtAsPaid: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let reloadSpy: ReturnType<typeof vi.fn>;

  const mockDebt: IDebt = debtsMock[0];

  beforeEach(async () => {
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    const debtsServiceMock = {
      deleteDebt: vi.fn(),
      markDebtAsPaid: vi.fn(),
    };

    const authServiceMock = {
      currentUser: signal<User | null>(currentUserMock),
      currentUserId: currentUserMock._id,
    };

    const routerMock = {
      navigate: vi.fn(),
    };

    const dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DebtDetail],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DebtsService, useValue: debtsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtDetail);
    component = fixture.componentInstance;
    debtsService = TestBed.inject(DebtsService) as unknown as typeof debtsServiceMock;
    router = TestBed.inject(Router) as unknown as typeof routerMock;
    dialog = TestBed.inject(MatDialog) as unknown as typeof dialogMock;

    component.debt = mockDebt;
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('When the counterparty getter is called', () => {
    it('Should return debtor info when current user is creditor', () => {
      const result = component.counterparty;

      expect(result.displayName).toBeDefined();
      expect(typeof result.displayName).toBe('string');
    });

    it('Should return creditor info when current user is debtor', () => {
      component.debt = {
        ...mockDebt,
        debtor: currentUserMock,
        creditor: debtsMock[1].creditor,
      };
      fixture.detectChanges();

      const result = component.counterparty;

      expect(result.displayName).toBeDefined();
      expect(typeof result.displayName).toBe('string');
    });

    it('Should handle string user correctly', () => {
      const expectedDisplayName = 'John Doe';
      component.debt = { ...mockDebt, debtor: expectedDisplayName };
      fixture.detectChanges();

      const result = component.counterparty;

      expect(result.displayName).toBe(expectedDisplayName);
      expect(result.email).toBeNull();
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
    });

    it('Should handle user object with all fields', () => {
      const result = component.counterparty;

      expect(result.displayName).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.firstName).toBeDefined();
      expect(result.lastName).toBeDefined();
    });
  });

  describe('When the statusInfo getter is called', () => {
    it('Should return correct info for unpaid status', () => {
      component.debt = { ...mockDebt, status: 'unpaid' };

      const result = component.statusInfo;

      expect(result.icon).toBe('progress_activity');
      expect(result.fontSet).toBe('material-symbols-outlined');
      expect(result.label).toBe('unpaid');
    });

    it('Should return correct info for paid status', () => {
      component.debt = { ...mockDebt, status: 'paid' };

      const result = component.statusInfo;

      expect(result.icon).toBe('check');
      expect(result.fontSet).toBe('material-icons');
      expect(result.label).toBe('paid');
    });

    it('Should return correct info for overdue status', () => {
      component.debt = { ...mockDebt, status: 'overdue' };

      const result = component.statusInfo;

      expect(result.icon).toBe('skull');
      expect(result.fontSet).toBe('material-symbols-outlined');
      expect(result.label).toBe('overdue');
    });
  });

  describe('When canMarkAsPaid is called', () => {
    it('Should return true for unpaid debt', () => {
      component.debt = { ...mockDebt, status: 'unpaid' };

      expect(component.canMarkAsPaid).toBeTruthy();
    });

    it('Should return true for overdue debt', () => {
      component.debt = { ...mockDebt, status: 'overdue' };

      expect(component.canMarkAsPaid).toBeTruthy();
    });

    it('Should return false for paid debt', () => {
      component.debt = { ...mockDebt, status: 'paid' };

      expect(component.canMarkAsPaid).toBeFalsy();
    });
  });

  describe('When edit button is triggered and onEdit is called', () => {
    it('Should navigate to edit route', () => {
      component.onEdit();

      expect(router.navigate).toHaveBeenCalledWith(['/debts', mockDebt._id, 'edit']);
    });
  });

  describe('When delete button is triggered and onDelete is called', () => {
    it('Should open confirm dialog', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(false) };

      dialog.open.mockReturnValue(mockDialogRef);
      component.onDelete();

      expect(dialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: {
          title: 'Delete Debt',
          message: `Are you sure you want to delete "${mockDebt.description}"?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      });
    });

    it('Should delete debt and navigate when confirmed', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(true) };

      dialog.open.mockReturnValue(mockDialogRef);
      debtsService.deleteDebt.mockReturnValue(of(void 0));
      component.onDelete();

      expect(debtsService.deleteDebt).toHaveBeenCalledWith(mockDebt._id);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('Should not delete debt when cancelled', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(false) };

      dialog.open.mockReturnValue(mockDialogRef);
      component.onDelete();

      expect(debtsService.deleteDebt).not.toHaveBeenCalled();
    });
  });

  describe('When mark as paid button is triggered and onMarkAsPaid is called', () => {
    it('Should open confirm dialog', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(false) };

      dialog.open.mockReturnValue(mockDialogRef);
      component.onMarkAsPaid();

      expect(dialog.open).toHaveBeenCalledWith(expect.any(Function), {
        data: {
          title: 'Mark as Paid',
          message: `Mark "${mockDebt.description}" as paid?`,
          confirmText: 'Mark as Paid',
          cancelText: 'Cancel',
        },
      });
    });

    it('Should mark debt as paid and reload when confirmed', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(true) };
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(vi.fn());

      dialog.open.mockReturnValue(mockDialogRef);
      debtsService.markDebtAsPaid.mockReturnValue(of(void 0));
      component.onMarkAsPaid();

      expect(debtsService.markDebtAsPaid).toHaveBeenCalledWith(mockDebt._id);
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('Should not mark as paid when cancelled', () => {
      const mockDialogRef = { afterClosed: (): Observable<boolean> => of(false) };

      dialog.open.mockReturnValue(mockDialogRef);
      component.onMarkAsPaid();

      expect(debtsService.markDebtAsPaid).not.toHaveBeenCalled();
    });
  });
});
