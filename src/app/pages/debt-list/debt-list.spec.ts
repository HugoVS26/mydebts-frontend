import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { DebtListPage } from './debt-list';
import { DebtsService } from '../../features/debts/services/debts';
import { provideRouter } from '@angular/router';

registerLocaleData(localeEs);

describe('Given a DebtListComponent page', () => {
  let component: DebtListPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtListPage],
      providers: [
        DebtsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DebtListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component its initialized', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
