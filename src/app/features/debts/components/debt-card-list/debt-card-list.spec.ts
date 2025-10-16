import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, of, take } from 'rxjs';

import type { DebtColumns } from './debt-card-list';
import { DebtCardList } from './debt-card-list';
import { DebtsService } from '../../services/debts';
import { debtsMock } from '../../mocks/debtsMock';
import type { IDebt } from '../../types/debt';

describe('Given a DebtList component', () => {
  let fixture: ComponentFixture<DebtCardList>;
  let component: DebtCardList;
  let debtsServiceMock: { getDebts: ReturnType<typeof vi.fn> };

  const currentUserId = '68adda76e019d1a45a6ae1fe';

  beforeEach(async () => {
    debtsServiceMock = {
      getDebts: vi.fn().mockReturnValue(of({ debts: debtsMock })),
    };

    await TestBed.configureTestingModule({
      imports: [DebtCardList],
      providers: [
        { provide: DebtsService, useValue: debtsServiceMock },
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

  describe('When a sorting debts', () => {
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
    it('Should filter debts by selected debtor ID', async () => {
      const debtor = debtsMock[0].debtor;
      const debtorId = typeof debtor === 'object' ? debtor._id : debtor;

      component.toggleMode('creditor');
      fixture.detectChanges();

      component.applyDebtorSelection([debtorId]);
      fixture.detectChanges();

      const filteredDebts = await firstValueFrom(component.filteredDebts$.pipe(take(1)));

      const allDebtors = filteredDebts.unpaid.map((debts) =>
        typeof debts.debtor === 'object' ? debts.debtor._id : debts.debtor,
      );

      expect(allDebtors).toContain(debtorId);
    });

    it('Should update firstSelectedDebtorName correctly', () => {
      component['_lastDebtorsSnapshot'] = [
        { _id: '2', name: 'John Doe' },
        { _id: '4', name: 'Alice Johnson' },
        { _id: '5', name: 'Bob Williams' },
      ];
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
      result.unpaid.forEach((debt) => {
        const creditorId = typeof debt.creditor === 'object' ? debt.creditor._id : debt.creditor;

        expect(creditorId).toBe(currentUserId);
      });
    });

    it('Should filter debts where current user is debtor in debtor mode', async () => {
      component.toggleMode('debtor');

      const result = await firstValueFrom(component.filteredDebts$);
      result.unpaid.forEach((debt) => {
        const debtorId = typeof debt.debtor === 'object' ? debt.debtor._id : debt.debtor;

        expect(debtorId).toBe(currentUserId);
      });
    });
  });
});
