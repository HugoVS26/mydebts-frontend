import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import type { Debt } from '../models/debt.model';

interface GetDebtsResponse {
  message: string;
  debts: Debt[];
}

@Injectable({
  providedIn: 'root',
})
export class DebtsService {
  private apirUrl = `${environment.apiUrl}/debts`;

  private http = inject(HttpClient);

  public getDebts(): Observable<GetDebtsResponse> {
    return this.http.get<GetDebtsResponse>(this.apirUrl);
  }
}
