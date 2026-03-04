import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServerWakeService {
  private waking = signal(false);
  readonly isWaking = this.waking.asReadonly();

  setWaking(value: boolean): void {
    this.waking.set(value);
  }
}
