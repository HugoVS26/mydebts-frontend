import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, of } from 'rxjs';

import { DebtCardList } from './debt-card-list';
import { DebtsService } from '../../services/debts';
import { debtsMock as unpaidDebtsMock } from '../../mocks/debtsMock';

describe('Given a DebtList component', () => {
  let fixture: ComponentFixture<DebtCardList>;
  let component: DebtCardList;
  let debtsServiceMock: { getDebts: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    debtsServiceMock = {
      getDebts: vi.fn().mockReturnValue(of({ debts: unpaidDebtsMock })),
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

  describe('When the component its initialized', () => {
    it('Should be created', () => {
      expect(component).toBeTruthy();
    });

    it('Should load debts data from getDebts service', async () => {
      const expectedDebts = await firstValueFrom(component.filteredDebts$);

      expect(expectedDebts.unpaid.length).toBe(1);
      expect(expectedDebts.paid.length).toBe(1);
      expect(expectedDebts.overdue.length).toBe(1);
    });
  });

  describe('When a sorting value is selected', () => {
    it('Should sort the debts list correctly', async () => {
      const sortingValue = 'amountDesc';
      component.selectedSort = sortingValue;

      const expectedMiddleDebtAmount = unpaidDebtsMock[0].amount;
      const expectedLowerDebtAmount = unpaidDebtsMock[1].amount;
      const expectedHigherDebtAmount = unpaidDebtsMock[2].amount;

      const sortedDebts = component['sortDebts'](unpaidDebtsMock, sortingValue);

      expect(sortedDebts[0].amount).toBe(expectedHigherDebtAmount);
      expect(sortedDebts[1].amount).toBe(expectedMiddleDebtAmount);
      expect(sortedDebts[2].amount).toBe(expectedLowerDebtAmount);
    });
  });

  describe('When a debtors name is selected in the filter', () => {
    const debtorName = unpaidDebtsMock[0].debtor.displayName;
    const debtorId = unpaidDebtsMock[0].debtor._id;

    it('Should filter debts by debtors name', async () => {
      component.applyDebtorSelection([debtorId]);

      const filteredDebts = await firstValueFrom(component.filteredDebts$);

      expect(filteredDebts.unpaid).toHaveLength(1);
      expect(filteredDebts.unpaid[0].debtor?.displayName).toBe(debtorName);
    });

    it('Should show in the select field the first debtor name', async () => {
      component['applyDebtorSelection']([debtorId]);
      component['_lastDebtorsSnapshot'] = [
        { _id: '2', name: 'John Doe' },
        { _id: '4', name: 'Alice Johnson' },
        { _id: '5', name: 'Bob Williams' },
      ];

      expect(component.firstSelectedDebtorName).toBe(debtorName);
    });
  });
});
