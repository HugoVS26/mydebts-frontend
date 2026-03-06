import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import type { ComponentFixture } from '@angular/core/testing';

import { DebtDetail } from './debt-detail';
import { AuthService } from '../../../auth/services/auth';
import { debtsMock, currentUserMock } from '../../mocks/debtsMock';
import type { IDebt } from '../../types/debt';
import type { User } from '../../../auth/types/user';

registerLocaleData(localeEs);

describe('Given a DebtDetail component', () => {
  let component: DebtDetail;
  let fixture: ComponentFixture<DebtDetail>;

  const mockDebt: IDebt = debtsMock[0];

  beforeEach(async () => {
    const authServiceMock = {
      currentUser: signal<User | null>(currentUserMock),
      currentUserId: currentUserMock._id,
    };

    await TestBed.configureTestingModule({
      imports: [DebtDetail],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtDetail);
    component = fixture.componentInstance;
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

  describe('When onEdit is called', () => {
    it('Should emit editDebt event', () => {
      let emitted = false;
      component.editDebt.subscribe(() => (emitted = true));

      component.onEdit();

      expect(emitted).toBe(true);
    });
  });

  describe('When onDelete is called', () => {
    it('Should emit deleteDebt event', () => {
      let emitted = false;
      component.deleteDebt.subscribe(() => (emitted = true));

      component.onDelete();

      expect(emitted).toBe(true);
    });
  });

  describe('When onMarkAsPaid is called', () => {
    it('Should emit markAsPaid event', () => {
      let emitted = false;
      component.markAsPaid.subscribe(() => (emitted = true));

      component.onMarkAsPaid();

      expect(emitted).toBe(true);
    });
  });
});
