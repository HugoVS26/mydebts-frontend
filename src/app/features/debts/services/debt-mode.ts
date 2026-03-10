import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DebtModeService {
  readonly mode = signal<'creditor' | 'debtor'>('creditor');

  setMode(mode: 'creditor' | 'debtor'): void {
    this.mode.set(mode);
  }
}
