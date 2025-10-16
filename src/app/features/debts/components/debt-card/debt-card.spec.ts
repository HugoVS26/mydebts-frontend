import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DebtCard } from './debt-card';
import { debtMock } from '../../mocks/debtsMock';

describe('Given a DebtCardComponent', () => {
  let fixture: ComponentFixture<DebtCard>;
  let component: DebtCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCard);
    component = fixture.componentInstance;

    component.debt = debtMock;

    fixture.detectChanges();
  });

  describe('When the component is initialized (creditor mode default)', () => {
    it('Should be created', () => {
      expect(component).toBeTruthy();
    });

    it('Should load the debts data', () => {
      expect(component.debt).toBeDefined();
      expect(component.debt).toEqual(debtMock);
    });

    it('Should render the debt details in the template', () => {
      const hostElement = fixture.nativeElement as HTMLElement;

      const debtTitle = hostElement.querySelector('.debt-card__title')?.textContent;
      const debtData = hostElement.querySelector('.debt-card__detail')?.textContent;
      const debtStatus = hostElement
        .querySelector('.debt-card__status-text')
        ?.textContent?.toLowerCase();

      const counterpartyName =
        typeof debtMock.debtor === 'object' ? debtMock.debtor.displayName : debtMock.debtor;

      expect(debtTitle).toContain(debtMock.description);
      expect(debtData).toContain(counterpartyName);
      expect(debtData).toContain(debtMock.amount);
      expect(debtStatus).toContain(debtMock.status);
    });

    it('Should show the correct icons for each debt status', () => {
      expect(component.statusIcons.paid).toEqual({
        icon: 'check',
        fontSet: 'material-icons',
      });

      expect(component.statusIcons.unpaid).toEqual({
        icon: 'progress_activity',
        fontSet: 'material-symbols-outlined',
      });

      expect(component.statusIcons.overdue).toEqual({
        icon: 'skull',
        fontSet: 'material-symbols-outlined',
      });
    });
  });

  describe('When the component is rendered in debtor mode', () => {
    it('Should render the debt details correctly', () => {
      const debtorFixture = TestBed.createComponent(DebtCard);
      const debtorComponent = debtorFixture.componentInstance;

      debtorComponent.debt = debtMock;
      debtorComponent.mode = 'debtor';
      debtorFixture.detectChanges();

      const hostElement = debtorFixture.nativeElement as HTMLElement;
      const debtData = hostElement.querySelector('.debt-card__detail')?.textContent;

      const counterpartyName =
        typeof debtMock.creditor === 'object' ? debtMock.creditor.displayName : debtMock.creditor;

      expect(debtData).toContain(counterpartyName);
      expect(debtData).toContain('You owe');
    });
  });
});
