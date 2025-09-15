import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { environment } from 'src/environments/environment';
import { DebtsService } from './debts.service';
import { debtsMock } from '../mocks/debtsMock';

describe('Given a DebtsService injectable', () => {
  let debtsService: DebtsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DebtsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });

    debtsService = TestBed.inject(DebtsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Should be created', () => {
    expect(debtsService).toBeTruthy();
  });

  describe('When getDebts method is called', () => {
    it('Should call the API and return debts', () => {
      const mockResponse = { message: 'success', debts: debtsMock };

      debtsService.getDebts().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(res.debts.length).toBe(debtsMock.length);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/debts`);
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });
});
