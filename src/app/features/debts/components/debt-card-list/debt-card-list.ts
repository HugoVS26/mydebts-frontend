import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, map, shareReplay, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { DebtCard } from '../debt-card/debt-card';
import { DebtsService } from '../../services/debts';
import { AuthService } from '../../../auth/services/auth';
import type { IDebt } from '../../types/debt';

export interface DebtColumns {
  unpaid: IDebt[];
  paid: IDebt[];
  overdue: IDebt[];
}

interface DebtorOption {
  _id?: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: 'creationDateDesc', label: 'Creation date: Newest' },
  { value: 'creationDateAsc', label: 'Creation date: Oldest' },
  { value: 'amountAsc', label: 'Amount: Lowest' },
  { value: 'amountDesc', label: 'Amount: Highest' },
  { value: 'debtDateAsc', label: 'Debt date: Earliest' },
  { value: 'debtDateDesc', label: 'Debt date: Latest' },
  { value: 'dueDateAsc', label: 'Due date: Earliest' },
  { value: 'dueDateDesc', label: 'Due date: Latest' },
];

@Component({
  selector: 'app-debt-card-list',
  standalone: true,
  imports: [DebtCard, AsyncPipe, MatButtonToggleModule, MatDividerModule, MatSelectModule],
  templateUrl: './debt-card-list.html',
  styleUrls: ['./debt-card-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCardList {
  private debtsService = inject(DebtsService);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  private currentUserId = computed(() => this.authService.currentUser()?._id ?? null);

  isDesktop$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay({ refCount: true }),
    );

  /** Toggle mode for creditor or debtor */
  private mode$ = new BehaviorSubject<'creditor' | 'debtor'>('creditor');

  get mode(): 'creditor' | 'debtor' {
    return this.mode$.value;
  }

  toggleMode(mode: 'creditor' | 'debtor'): void {
    this.mode$.next(mode);
  }

  /**  Sorting */
  sortOptions = SORT_OPTIONS;
  private sortSelection$ = new BehaviorSubject<string>('creationDateDesc');

  get selectedSort(): string {
    return this.sortSelection$.value;
  }
  set selectedSort(value: string) {
    this.applySortSelection(value);
  }
  applySortSelection(sort: string): void {
    this.sortSelection$.next(sort);
  }

  private sortDebts(debts: IDebt[], sort: string): IDebt[] {
    if (!sort) return debts;
    return [...debts].sort((a, b) => {
      switch (sort) {
        case 'creationDateAsc':
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case 'creationDateDesc':
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        case 'amountAsc':
          return a.amount - b.amount;
        case 'amountDesc':
          return b.amount - a.amount;
        case 'debtDateAsc':
          return +new Date(a.debtDate) - +new Date(b.debtDate);
        case 'debtDateDesc':
          return +new Date(b.debtDate) - +new Date(a.debtDate);
        case 'dueDateAsc':
          return +new Date(a.dueDate) - +new Date(b.dueDate);
        case 'dueDateDesc':
          return +new Date(b.dueDate) - +new Date(a.dueDate);
        default:
          return 0;
      }
    });
  }

  /** Debtor filter */
  private debtorSelection$ = new BehaviorSubject<string[]>([]);

  get selectedDebtors(): string[] {
    return this.debtorSelection$.value;
  }
  set selectedDebtors(value: string[]) {
    this.applyDebtorSelection(value);
  }
  applyDebtorSelection(debtors: string[]): void {
    this.debtorSelection$.next(debtors ?? []);
  }

  /** Raw debts */
  private debtsRaw$ = this.debtsService.getDebts().pipe(
    map((res) => res.debts ?? []),
    shareReplay({ refCount: true }),
  );

  /** Distinct debtors (for dropdown) */
  private _lastDebtorsSnapshot: DebtorOption[] | null = null;

  debtors$: Observable<DebtorOption[]> = combineLatest([this.debtsRaw$, this.mode$]).pipe(
    map(([debts, mode]) => {
      const currentUserId = this.currentUserId();
      if (!currentUserId) return [];

      const mapById = new Map<string, DebtorOption>();

      for (const debt of debts) {
        const otherUser = mode === 'creditor' ? debt.debtor : debt.creditor;

        if (otherUser === currentUserId || !otherUser) continue;

        const _id = typeof otherUser === 'string' ? otherUser : (otherUser._id ?? 'unknown');
        const name =
          typeof otherUser === 'string' ? otherUser : (otherUser.displayName ?? 'Unnamed');

        if (!mapById.has(_id)) mapById.set(_id, { _id: _id, name });
      }

      return Array.from(mapById.values());
    }),
    tap((list) => (this._lastDebtorsSnapshot = list)),
  );

  /** First selected debtor name (for mat-select-trigger) */
  get firstSelectedDebtorName(): string {
    if (!this._lastDebtorsSnapshot || this.selectedDebtors.length === 0) return '';
    const first = this._lastDebtorsSnapshot.find((d) => d._id === this.selectedDebtors[0]);
    return first?.name ?? '';
  }

  /** Final filtered debts */
  filteredDebts$: Observable<DebtColumns> = combineLatest([
    this.debtsRaw$,
    this.sortSelection$,
    this.mode$,
    this.debtorSelection$,
  ]).pipe(
    map(([debts, sort, mode, selectedDebtors]) => {
      const currentUserId = this.currentUserId();
      if (!currentUserId) {
        return { unpaid: [], paid: [], overdue: [] };
      }

      const filtered = debts.filter((debt) => {
        const otherUser = mode === 'creditor' ? debt.debtor : debt.creditor;

        const otherUserId =
          typeof otherUser === 'string' ? otherUser : (otherUser._id ?? 'unknown');
        const matchesSelection =
          selectedDebtors.length === 0 || selectedDebtors.includes(otherUserId);

        const isNotCurrentUser = otherUserId !== currentUserId;

        const involvesCurrentUser =
          mode === 'creditor'
            ? (typeof debt.creditor === 'string' ? debt.creditor : debt.creditor._id) ===
              currentUserId
            : (typeof debt.debtor === 'string' ? debt.debtor : debt.debtor._id) === currentUserId;

        return matchesSelection && isNotCurrentUser && involvesCurrentUser;
      });

      return {
        unpaid: this.sortDebts(
          filtered.filter((d) => d.status === 'unpaid'),
          sort,
        ),
        paid: this.sortDebts(
          filtered.filter((d) => d.status === 'paid'),
          sort,
        ),
        overdue: this.sortDebts(
          filtered.filter((d) => d.status === 'overdue'),
          sort,
        ),
      };
    }),
  );

  /** Helpers */
  trackByDebtId(index: number, debt: IDebt): string {
    return debt._id;
  }
}
