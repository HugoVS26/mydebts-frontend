import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DebtCardComponent } from './debt-card';
import { debtMock } from '../../mocks/debtsMock';

describe('Given a DebtCardComponent', () => {
  let fixture: ComponentFixture<DebtCardComponent>;
  let component: DebtCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtCardComponent);
    component = fixture.componentInstance;

    component.debt = debtMock;

    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should be created', () => {
      expect(component).toBeTruthy();
    });

    it('Should load the debts data', () => {
      expect(component.debt).toBeDefined();
      expect(component.debt).toEqual(debtMock);
    });
  });

  it('Should render the debt details in the template', () => {
    const hostElement = fixture.nativeElement as HTMLElement;

    const debtTitle = hostElement.querySelector('.debt-card__title')?.textContent;
    const debtData = hostElement.querySelector('.debt-card__detail')?.textContent;
    const debtStatus = hostElement
      .querySelector('.debt-card__status-text')
      ?.textContent.toLowerCase();

    expect(debtTitle).toContain(debtMock.description);
    expect(debtData).toContain(debtMock.debtor.displayName);
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
