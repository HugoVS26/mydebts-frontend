import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import type { IDebt } from '../types/debt';

@Injectable({ providedIn: 'root' })
export class SharedDebtService {
  private readonly apiUrl = `${environment.apiUrl}/share`;
  private http = inject(HttpClient);

  getByToken(token: string): Observable<IDebt> {
    return this.http.get<IDebt>(`${this.apiUrl}/${token}`);
  }
}
