import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNativeDateAdapter } from '@angular/material/core';

import { DebtForm } from './debt-form';
import { DebtsService } from '../../services/debts';
import { debtMock } from '../../mocks/debtsMock';
import type { IDebtCreate } from '../../types/debt';

describe('Given a DebtForm component', () => {
  let component: DebtForm;
  let fixture: ComponentFixture<DebtForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtForm],
      providers: [
        DebtsService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component its rendered (create mode as default)', () => {
    const defaultMode = 'create';
    const defaultDebtMode = 'creditor';

    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should initialize in create mode', () => {
      expect(component.mode).toBe(defaultMode);
    });

    it('Should initialize form with empty values', () => {
      expect(component.form.get('counterparty')?.value).toBe('');
      expect(component.form.get('description')?.value).toBe('');
      expect(component.form.get('amount')?.value).toBeNull();
      expect(component.form.get('debtDate')?.value).toBeInstanceOf(Date);
      expect(component.form.get('dueDate')?.value).toBeNull();
    });

    it('Should set debtMode signal to creditor by default', () => {
      expect(component.debtMode()).toBe(defaultDebtMode);
    });
  });

  describe('When validating in create mode', () => {
    it('Should require a counterparty', () => {
      const counterparty = component.form.get('counterparty');

      expect(counterparty?.hasError('required')).toBeTruthy();
    });

    it('Should require a description', () => {
      const description = component.form.get('description');

      expect(description?.hasError('required')).toBeTruthy();
    });

    it('Should require an amount', () => {
      const amount = component.form.get('amount');

      expect(amount?.hasError('required')).toBeTruthy();
    });

    it('Should validate minimum amount', () => {
      const amount = component.form.get('amount');

      amount?.setValue(0);

      expect(amount?.hasError('min')).toBeTruthy();

      amount?.setValue(0.01);

      expect(amount?.hasError('min')).toBeFalsy();
    });

    it('Should validate minimum description length', () => {
      const description = component.form.get('description');

      description?.setValue('');

      expect(description?.hasError('required')).toBeTruthy();

      description?.setValue('A');

      expect(description?.hasError('minlength')).toBeFalsy();
    });

    it('Should mark form as valid when all required fields are filled', () => {
      component.form.patchValue({
        counterparty: 'John Doe',
        description: 'Test debt',
        amount: 100,
      });

      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('When the component is rendered in update mode', () => {
    beforeEach(() => {
      component.mode = 'update';
      component.initialData = debtMock;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('Should initialize the form with debt data', () => {
      expect(component.form.get('description')?.value).toBe(debtMock.description);
      expect(component.form.get('amount')?.value).toBe(debtMock.amount);

      const formDueDate = component.form.get('dueDate')?.value as Date;
      const expectedDueDate = new Date(debtMock.dueDate);

      expect(formDueDate?.getTime()).toBe(expectedDueDate.getTime());
    });

    it('Should disable debtDate field', () => {
      expect(component.form.get('debtDate')?.disabled).toBeTruthy();
    });

    it('Should not require a counterparty', () => {
      const counterparty = component.form.get('counterparty');
      expect(counterparty?.hasError('required')).toBeFalsy();
    });

    it('Should make all fields optional', () => {
      component.form.patchValue({
        description: '',
        amount: null,
        dueDate: null,
      });

      const description = component.form.get('description');
      const amount = component.form.get('amount');
      const dueDate = component.form.get('dueDate');

      expect(description?.hasError('required')).toBeFalsy();
      expect(amount?.hasError('required')).toBeFalsy();
      expect(dueDate?.hasError('required')).toBeFalsy();
    });

    it('Should validate at least one field has been modified', () => {
      component.form.get('description')?.markAsTouched();
      component.form.updateValueAndValidity();

      component.form.patchValue({ description: 'Modified description' });

      expect(component.form.hasError('noChanges')).toBeFalsy();
    });
  });

  describe('When validating dueDate', () => {
    it('Should validate dueDate is not before debtDate', () => {
      const debtDate = new Date('2025-10-16');
      const dueDate = new Date('2025-10-15');

      component.form.patchValue({
        debtDate,
        dueDate,
      });

      expect(component.form.get('dueDate')?.hasError('beforeDebtDate')).toBeTruthy();
    });

    it('Should accept a dueDate equal to or after debtDate', () => {
      const debtDate = new Date('2025-10-16');
      const dueDate = new Date('2025-10-16');

      component.form.patchValue({
        debtDate,
        dueDate,
      });

      expect(component.form.get('dueDate')?.hasError('beforeDebtDate')).toBeFalsy();
    });

    it('Should allow dueDate to be empty as it is optional field', () => {
      component.form.patchValue({
        debtDate: new Date('2024-01-15'),
        dueDate: null,
      });

      expect(component.form.get('dueDate')?.hasError('beforeDebtDate')).toBe(false);
    });
  });

  describe('When form is on create mode and the debt mode is toggled', () => {
    it('Should change counterparty label based on debt mode', () => {
      component.debtMode.set('creditor');

      expect(component.counterpartyLabel).toBe('Debtor');

      component.debtMode.set('debtor');

      expect(component.counterpartyLabel).toBe('Creditor');
    });

    it('Should change counterparty placeholder based on debt mode', () => {
      const counterpartyCreditorPlaceholder = 'Enter the name of who owes you';
      component.debtMode.set('creditor');

      expect(component.counterpartyPlaceholder).toBe(counterpartyCreditorPlaceholder);

      const counterpartyDebtorPlaceholder = 'Enter the name of who you owe';
      component.debtMode.set('debtor');

      expect(component.counterpartyPlaceholder).toBe(counterpartyDebtorPlaceholder);
    });
  });

  describe('When the form is filled with valid data', () => {
    const validFormData = {
      counterparty: 'John Doe',
      description: 'Test debt',
      amount: 100,
      debtDate: new Date('2024-01-15T00:00:00.000Z'),
      dueDate: new Date('2024-02-15T00:00:00.000Z'),
    };

    const currentUserId = '68adda76e019d1a45a6ae1fe';

    it('Should emit formSubmit with create payload in creditor mode', () => {
      const spy = vi.spyOn(component.formSubmit, 'emit');
      component.debtMode.set('creditor');

      component.form.patchValue(validFormData);
      component.form.get('dueDate')?.updateValueAndValidity();
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          debtor: validFormData.counterparty,
          creditor: currentUserId,
          description: validFormData.description,
          amount: validFormData.amount,
        }),
      );
    });

    it('Should emit formSubmit with create payload in debtor mode', () => {
      const spy = vi.spyOn(component.formSubmit, 'emit');
      const debtorFormData = {
        ...validFormData,
        counterparty: 'Jane Smith',
        amount: 200,
      };

      component.debtMode.set('debtor');
      component.form.patchValue(debtorFormData);
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          debtor: currentUserId,
          creditor: debtorFormData.counterparty,
          description: debtorFormData.description,
          amount: debtorFormData.amount,
        }),
      );
    });

    it('Should emit only changed fields in update mode', () => {
      const updatedDescription = 'Updated description';

      component.mode = 'update';
      component.initialData = debtMock;
      component.ngOnInit();
      fixture.detectChanges();

      const spy = vi.spyOn(component.formSubmit, 'emit');
      component.form.patchValue({ description: updatedDescription });
      component.onSubmit();

      expect(spy).toHaveBeenCalledWith({
        description: updatedDescription,
      });
    });

    it('Should convert dates to ISO strings', () => {
      const spy = vi.spyOn(component.formSubmit, 'emit');

      component.form.patchValue(validFormData);
      component.onSubmit();

      const payload = spy.mock.calls[0][0] as IDebtCreate;
      expect(typeof payload.debtDate).toBe('string');
      expect(typeof payload.dueDate).toBe('string');
    });
  });

  describe('When the form is filled with invalid data', () => {
    it('Should not allow submitting the form', () => {
      const spy = vi.spyOn(component.formSubmit, 'emit');
      component.onSubmit();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('When the form is cancelled', () => {
    it('Should emit formCancel event', () => {
      const spy = vi.spyOn(component.formCancel, 'emit');
      component.onCancel();

      expect(spy).toHaveBeenCalled();
    });
  });
});
