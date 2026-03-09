import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { SharedDebtPage } from './shared-debt';
import { SharedDebtService } from '../../features/debts/services/shared-debt';
import { debtMock } from '../../features/debts/mocks/debtsMock';

registerLocaleData(localeEs);

beforeEach(() => {
  activatedRouteMock.snapshot.paramMap.get.mockReturnValue(TOKEN);
});

const TOKEN = 'valid-token-123';

const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: vi.fn().mockReturnValue(TOKEN),
    },
  },
};

describe('Given a SharedDebtPage component', () => {
  let component: SharedDebtPage;
  let fixture: ComponentFixture<SharedDebtPage>;
  let sharedDebtService: SharedDebtService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedDebtPage],
      providers: [
        SharedDebtService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'share/:token', component: SharedDebtPage }]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: LOCALE_ID, useValue: 'es-ES' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedDebtPage);
    component = fixture.componentInstance;
    sharedDebtService = TestBed.inject(SharedDebtService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(of(debtMock));
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('Should have debt as undefined initially', () => {
      expect(component.debt()).toBeUndefined();
    });

    it('Should have expired as false initially', () => {
      expect(component.expired()).toBe(false);
    });
  });

  describe('When the token is missing', () => {
    it('Should navigate to home', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
      const navigateSpy = vi.spyOn(router, 'navigate');

      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('When the token is valid and debt loads successfully', () => {
    it('Should set debt signal with response', () => {
      vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(of(debtMock));

      fixture.detectChanges();

      expect(component.debt()).toEqual(debtMock);
    });

    it('Should call getByToken with the token from route', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(TOKEN);
      const spy = vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(of(debtMock));

      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(TOKEN);
    });

    it('Should not set expired to true', () => {
      vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(of(debtMock));

      fixture.detectChanges();

      expect(component.expired()).toBe(false);
    });
  });

  describe('When the token is invalid or expired', () => {
    it('Should set expired signal to true', () => {
      vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(
        throwError(() => new Error('Not found')),
      );

      fixture.detectChanges();

      expect(component.expired()).toBe(true);
    });

    it('Should not set debt signal', () => {
      vi.spyOn(sharedDebtService, 'getByToken').mockReturnValue(
        throwError(() => new Error('Not found')),
      );

      fixture.detectChanges();

      expect(component.debt()).toBeUndefined();
    });
  });
});
