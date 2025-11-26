import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { DebtDetailPage } from './debt-detail';
import { DebtsService } from 'src/app/features/debts/services/debts';
import { debtsMock } from 'src/app/features/debts/mocks/debtsMock';
import type { IDebt } from 'src/app/features/debts/types/debt';
import { of, throwError } from 'rxjs';

describe('DebtDetail', () => {
  let component: DebtDetailPage;
  let fixture: ComponentFixture<DebtDetailPage>;
  let debtsService: { getDebtById: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let activatedRoute: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  const mockDebt: IDebt = debtsMock[0];
  const mockDebtId = 'test-id-123';

  beforeEach(async () => {
    const debtsServiceMock = {
      getDebtById: vi.fn(),
    };

    const routerMock = {
      navigate: vi.fn(),
    };

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn(),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [DebtDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: DebtsService, useValue: debtsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DebtDetailPage);
    component = fixture.componentInstance;

    debtsService = TestBed.inject(DebtsService) as unknown as typeof debtsServiceMock;
    router = TestBed.inject(Router) as unknown as typeof routerMock;
    activatedRoute = TestBed.inject(ActivatedRoute) as unknown as typeof activatedRouteMock;
  });

  it('Should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('When the component is initialized', () => {
    it('Should load debt data when there is a valid debtId', () => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue(mockDebtId);
      debtsService.getDebtById.mockReturnValue(of({ debt: mockDebt }));

      component.ngOnInit();

      expect(activatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('debtId');
      expect(debtsService.getDebtById).toHaveBeenCalledWith(mockDebtId);
      expect(component.debt()).toEqual(mockDebt);
    });

    it('Should navigate to home when debtId is invalid or there is an error laoding its data', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

      activatedRoute.snapshot.paramMap.get.mockReturnValue(mockDebtId);
      debtsService.getDebtById.mockReturnValue(
        throwError(() => {
          new Error('Could not load debt');
        }),
      );

      component.ngOnInit();

      expect(debtsService.getDebtById).toHaveBeenCalledWith(mockDebtId);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('Should navigate to home when debtId is missing', () => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(debtsService.getDebtById).not.toHaveBeenCalled();
    });
  });
});
