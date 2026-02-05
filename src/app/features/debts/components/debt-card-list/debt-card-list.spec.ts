import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, of, take } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import type { DebtColumns } from './debt-card-list';
import { DebtCardList } from './debt-card-list';
import { DebtsService } from '../../services/debts';
import { AuthService } from '../../../auth/services/auth';
import { debtsMock, currentUserMock } from '../../mocks/debtsMock';
import type { IDebt } from '../../types/debt';
import type { User } from '../../../auth/types/user';

registerLocaleData(localeEs);

describe('Given a DebtList component', () => {
  let fixture: ComponentFixture<DebtCardList>;
  let component: DebtCardList;
  let debtsServiceMock: { getDebts: ReturnType<typeof vi.fn> };
  let authServiceMock: { currentUser: ReturnType<typeof signal<User | null>> };

  beforeEach(async () => {
    debtsServiceMock = {
      getDebts: vi.fn().mockReturnValue(of({ debts: debtsMock })),
    };

    authServiceMock = {
      currentUser: signal<User | null>(currentUserMock),
    };

    await TestBed.configureTestingModule({
      imports: [DebtCardList],
      providers: [
        { provide: DebtsService, useValue: debtsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCardList);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('When the component its initialized (creditor mode as default)', () => {
    it('Should be created', () => {
      expect(component).toBeTruthy();
    });

    it('Should load debts data from getDebts service', async () => {
      const expectedDebts = (await firstValueFrom(
        component.filteredDebts$.pipe(take(1)),
      )) as DebtColumns;

      expect(expectedDebts.unpaid.length).toBe(1);
      expect(expectedDebts.paid.length).toBe(1);
      expect(expectedDebts.overdue.length).toBe(1);
    });
  });

  describe('When sorting debts', () => {
    it('Should sort debts in descending order by amount', async () => {
      const sortingValue = 'amountDesc';
      component.selectedSort = sortingValue;

      const sortedDebts = component['sortDebts'](debtsMock as IDebt[], sortingValue);

      expect(sortedDebts[0].amount).toBeGreaterThan(sortedDebts[1].amount);
    });

    it('Should sort debts in ascending order by due date', () => {
      const sortingValue = 'dueDateAsc';

      const sortedDebts = component['sortDebts'](debtsMock as IDebt[], sortingValue);
      const firstDue = new Date(sortedDebts[0].dueDate).getTime();
      const secondDue = new Date(sortedDebts[1].dueDate).getTime();

      expect(firstDue).toBeLessThanOrEqual(secondDue);
    });
  });

  describe('When filtering by selected debtors', () => {
    it('Should filter debts by selected debtor _id', async () => {
      const debtor = debtsMock[0].debtor;
      const debtorId = typeof debtor === 'object' ? debtor._id : debtor;

      component.toggleMode('creditor');
      fixture.detectChanges();

      component.applyDebtorSelection([debtorId]);
      fixture.detectChanges();

      const filteredDebts = await firstValueFrom(component.filteredDebts$.pipe(take(1)));

      const allDebtors = filteredDebts.unpaid.map((debt) =>
        typeof debt.debtor === 'object' ? debt.debtor._id : debt.debtor,
      );

      expect(allDebtors).toContain(debtorId);
    });

    it('Should update firstSelectedDebtorName correctly', async () => {
      await firstValueFrom(component.debtors$.pipe(take(1)));

      component['applyDebtorSelection'](['2']);

      expect(component.firstSelectedDebtorName).toBe('John Doe');
    });
  });

  describe('When toggling between creditor and debtor mode', () => {
    it('Should be default in creditor mode', () => {
      expect(component.mode).toBe('creditor');
    });

    it('Should update mode reactively when toggled', async () => {
      component.toggleMode('debtor');

      expect(component.mode).toBe('debtor');
    });

    it('Should filter debts where current user is creditor in creditor mode', async () => {
      component.toggleMode('creditor');

      const result = await firstValueFrom(component.filteredDebts$);

      const allCreditorDebts = [...result.unpaid, ...result.paid, ...result.overdue];

      allCreditorDebts.forEach((debt) => {
        const creditorId = typeof debt.creditor === 'object' ? debt.creditor._id : debt.creditor;

        expect(creditorId).toBe(currentUserMock._id);
      });
    });

    it('Should filter debts where current user is debtor in debtor mode', async () => {
      component.toggleMode('debtor');

      const result = await firstValueFrom(component.filteredDebts$);

      const allDebtorDebts = [...result.unpaid, ...result.paid, ...result.overdue];

      allDebtorDebts.forEach((debt) => {
        const debtorId = typeof debt.debtor === 'object' ? debt.debtor._id : debt.debtor;

        expect(debtorId).toBe(currentUserMock._id);
      });
    });
  });

  describe('When user is not authenticated', () => {
    it('Should return empty debt columns', async () => {
      authServiceMock.currentUser.set(null);
      fixture.detectChanges();

      const result = await firstValueFrom(component.filteredDebts$);

      expect(result.unpaid.length).toBe(0);
      expect(result.paid.length).toBe(0);
      expect(result.overdue.length).toBe(0);
    });

    it('Should return empty debtors list', async () => {
      authServiceMock.currentUser.set(null);
      fixture.detectChanges();

      const debtors = await firstValueFrom(component.debtors$);

      expect(debtors.length).toBe(0);
    });
  });
});
