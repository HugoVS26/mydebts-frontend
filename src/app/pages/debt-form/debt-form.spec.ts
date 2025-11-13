import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DebtFormPage } from './debt-form';
import { DebtsService } from 'src/app/features/debts/services/debts';
import { createDebtMock } from 'src/app/features/debts/mocks/debtsMock';
import type { IDebtCreate, IDebtUpdate } from 'src/app/features/debts/types/debt';

describe('DebtForm', () => {
  let component: DebtFormPage;
  let fixture: ComponentFixture<DebtFormPage>;
  let debtsService: DebtsService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let httpMock: HttpTestingController;

  const DEBT_ID = '68cd254b869570358716cdef';
  const HOME_ROUTE = '/';

  const mockDebtCreatePayload: IDebtCreate = {
    debtor: 'John Doe',
    creditor: '68adda76e019d1a45a6ae1fe',
    description: 'Test debt',
    amount: 100,
    debtDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
  };

  const mockDebtUpdatePayload: IDebtUpdate = {
    description: 'Updated description',
    amount: 200,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtFormPage],
      providers: [
        DebtsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([
          { path: '', component: DebtFormPage },
          { path: 'debts/:debtId', component: DebtFormPage },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtFormPage);
    component = fixture.componentInstance;
    debtsService = TestBed.inject(DebtsService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('When the component is initialized', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should initialize in create mode (default)', () => {
      expect(component.mode()).toBe('create');
    });

    it('Should have initialData undefined by default', () => {
      expect(component.initialData()).toBeUndefined();
    });
  });

  describe('When the component is rendered with a debtId in route params', () => {
    const mockDebt = createDebtMock();

    beforeEach(() => {
      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(DEBT_ID);

      vi.spyOn(debtsService, 'getDebtById').mockReturnValue(
        of({ message: 'Success', debt: mockDebt }),
      );

      fixture.detectChanges();
    });

    it('Should set mode to update', () => {
      expect(component.mode()).toBe('update');
    });

    it('Should load debt data', () => {
      expect(debtsService.getDebtById).toHaveBeenCalledWith(DEBT_ID);
      expect(component.initialData()).toEqual(mockDebt);
    });
  });

  describe('When loading debt fails', () => {
    it('Should navigate to home on error', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const error = new Error('Load failed');

      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(DEBT_ID);
      vi.spyOn(debtsService, 'getDebtById').mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([HOME_ROUTE]);
    });
  });

  describe('When the component loads without a debtId', () => {
    beforeEach(() => {
      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(null);
      fixture.detectChanges();
    });

    it('Should remain in create mode', () => {
      expect(component.mode()).toBe('create');
    });

    it('Should not load any debt data', () => {
      const spy = vi.spyOn(debtsService, 'getDebtById');

      expect(spy).not.toHaveBeenCalled();
      expect(component.initialData()).toBeUndefined();
    });
  });

  describe('When handling form submission in create mode', () => {
    beforeEach(() => {
      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(null);
      fixture.detectChanges();
    });

    it('Should call createDebt service method', () => {
      const mockDebt = createDebtMock();
      const spy = vi
        .spyOn(debtsService, 'createDebt')
        .mockReturnValue(of({ message: 'Created', debt: mockDebt }));

      component.handleFormSubmit(mockDebtCreatePayload);

      expect(spy).toHaveBeenCalledWith(mockDebtCreatePayload);
    });

    it('Should navigate to home on successful creation', () => {
      const mockDebt = createDebtMock();
      const navigateSpy = vi.spyOn(router, 'navigate');

      vi.spyOn(debtsService, 'createDebt').mockReturnValue(
        of({ message: 'Created', debt: mockDebt }),
      );

      component.handleFormSubmit(mockDebtCreatePayload);

      expect(navigateSpy).toHaveBeenCalledWith([HOME_ROUTE]);
    });

    it('Should not navigate to home on creation error', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const error = new Error('Create failed');

      vi.spyOn(debtsService, 'createDebt').mockReturnValue(throwError(() => error));

      component.handleFormSubmit(mockDebtCreatePayload);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('When handling form submission in update mode', () => {
    beforeEach(() => {
      const mockDebt = createDebtMock();

      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(DEBT_ID);
      vi.spyOn(debtsService, 'getDebtById').mockReturnValue(
        of({ message: 'Success', debt: mockDebt }),
      );

      fixture.detectChanges();
    });

    it('Should call updateDebt service method', () => {
      const mockDebt = createDebtMock();
      const spy = vi
        .spyOn(debtsService, 'updateDebt')
        .mockReturnValue(of({ message: 'Updated', debt: mockDebt }));

      component.handleFormSubmit(mockDebtUpdatePayload);

      expect(spy).toHaveBeenCalledWith(DEBT_ID, mockDebtUpdatePayload);
    });

    it('Should navigate to debt detail on successful update', () => {
      const mockDebt = createDebtMock();
      const navigateSpy = vi.spyOn(router, 'navigate');

      vi.spyOn(debtsService, 'updateDebt').mockReturnValue(
        of({ message: 'Updated', debt: mockDebt }),
      );

      component.handleFormSubmit(mockDebtUpdatePayload);

      expect(navigateSpy).toHaveBeenCalledWith([`/debts/${DEBT_ID}`]);
    });

    it('Should not navigate update error', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      const error = new Error('Update failed');

      vi.spyOn(debtsService, 'updateDebt').mockReturnValue(throwError(() => error));

      component.handleFormSubmit(mockDebtUpdatePayload);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('When handling form cancellation', () => {
    it('Should navigate to home when creating', () => {
      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(null);
      fixture.detectChanges();

      const navigateSpy = vi.spyOn(router, 'navigate');

      component.handleFormCancel();

      expect(navigateSpy).toHaveBeenCalledWith([HOME_ROUTE]);
    });

    it('Should navigate to debt detail when editing a debt', () => {
      const mockDebt = createDebtMock();
      const navigateSpy = vi.spyOn(router, 'navigate');

      vi.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue(DEBT_ID);
      vi.spyOn(debtsService, 'getDebtById').mockReturnValue(
        of({ message: 'Success', debt: mockDebt }),
      );

      fixture.detectChanges();

      component.handleFormCancel();

      expect(navigateSpy).toHaveBeenCalledWith([`/debts/${DEBT_ID}`]);
    });
  });
});
