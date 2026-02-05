import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { DebtCard } from './debt-card';
import { debtMock } from '../../mocks/debtsMock';

registerLocaleData(localeEs);

describe('Given a DebtCardComponent', () => {
  let fixture: ComponentFixture<DebtCard>;
  let component: DebtCard;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtCard],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCard);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

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

      const formattedAmount = debtMock.amount.toFixed(2).replace('.', ',');

      expect(debtTitle).toContain(debtMock.description);
      expect(debtData).toContain(counterpartyName);
      expect(debtData).toContain(formattedAmount);
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

  describe('When card is clicked', () => {
    it('Then it should navigate to debt detail page with the correct debt _id', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.debt = { ...debtMock, _id: '456' };

      component.onCardClick();

      expect(navigateSpy).toHaveBeenCalledWith(['/debts', '456']);
    });
  });
});
