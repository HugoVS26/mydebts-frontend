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

@Injectable({
  providedIn: 'root',
})
export class DebtsService {
  private apirUrl = `${environment.apiUrl}/debts`;

  private http = inject(HttpClient);

  public getDebts(): Observable<MultipleDebtsResponse> {
    return this.http.get<MultipleDebtsResponse>(this.apirUrl);
  }

  public getDebtById(debtId: string): Observable<SingleDebtResponse> {
    return this.http.get<SingleDebtResponse>(`${this.apirUrl}/${debtId}`);
  }

  public createDebt(debt: IDebtCreate): Observable<SingleDebtResponse> {
    return this.http.post<SingleDebtResponse>(this.apirUrl, debt);
  }

  public updateDebt(debtId: string, debt: IDebtUpdate): Observable<SingleDebtResponse> {
    return this.http.put<SingleDebtResponse>(`${this.apirUrl}/${debtId}`, debt);
  }
}
