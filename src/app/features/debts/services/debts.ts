import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import type { IDebt, IDebtCreate, IDebtUpdate } from '../types/debt';

interface MultipleDebtsResponse {
  message: string;
  debts: IDebt[];
}

interface SingleDebtResponse {
  message: string;
  debt: IDebt;
}

interface DeleteDebtResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DebtsService {
  private readonly apiUrl = `${environment.apiUrl}/debts`;

  private http = inject(HttpClient);

  getDebts(): Observable<MultipleDebtsResponse> {
    return this.http.get<MultipleDebtsResponse>(this.apiUrl);
  }

  getDebtById(debtId: string): Observable<SingleDebtResponse> {
    return this.http.get<SingleDebtResponse>(`${this.apiUrl}/${debtId}`);
  }

  createDebt(debt: IDebtCreate): Observable<SingleDebtResponse> {
    return this.http.post<SingleDebtResponse>(this.apiUrl, debt);
  }

  updateDebt(debtId: string, debt: IDebtUpdate): Observable<SingleDebtResponse> {
    return this.http.put<SingleDebtResponse>(`${this.apiUrl}/${debtId}`, debt);
  }

  deleteDebt(debtId: string): Observable<DeleteDebtResponse> {
    return this.http.delete<DeleteDebtResponse>(`${this.apiUrl}/${debtId}`);
  }

  markDebtAsPaid(debtId: string): Observable<SingleDebtResponse> {
    return this.http.patch<SingleDebtResponse>(`${this.apiUrl}/${debtId}/paid`, {});
  }
}
