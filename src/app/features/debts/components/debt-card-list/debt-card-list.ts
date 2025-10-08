import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, map, shareReplay, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { DebtCardComponent } from '../debt-card/debt-card';
import { DebtsService } from '../../services/debts';
import type { IDebt } from '../../models/debt.model';

interface DebtColumns {
  unpaid: IDebt[];
  paid: IDebt[];
  overdue: IDebt[];
}

interface DebtorOption {
  _id: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: 'creationDateAsc', label: 'Creation date: Oldest' },
  { value: 'creationDateDesc', label: 'Creation date: Newest' },
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
  imports: [DebtCardComponent, AsyncPipe, MatDividerModule, MatSelectModule],
  templateUrl: './debt-card-list.html',
  styleUrls: ['./debt-card-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCardList {
  private debtsService = inject(DebtsService);
  private breakpointObserver = inject(BreakpointObserver);

  public isDesktop$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay({ refCount: true }),
    );

  /**  Sorting */
  public sortOptions = SORT_OPTIONS;
  private sortSelection$ = new BehaviorSubject<string>('creationDateAsc');

  public get selectedSort(): string {
    return this.sortSelection$.value;
  }
  public set selectedSort(value: string) {
    this.applySortSelection(value);
  }
  public applySortSelection(sort: string): void {
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

  public get selectedDebtors(): string[] {
    return this.debtorSelection$.value;
  }
  public set selectedDebtors(value: string[]) {
    this.applyDebtorSelection(value);
  }
  public applyDebtorSelection(debtors: string[]): void {
    this.debtorSelection$.next(debtors ?? []);
  }

  /** Raw debts */
  private debtsRaw$ = this.debtsService.getDebts().pipe(
    map((res) => res.debts ?? []),
    shareReplay({ refCount: true }),
  );

  /** Distinct debtors (for dropdown) */
  private _lastDebtorsSnapshot: DebtorOption[] | null = null;
  public debtors$: Observable<DebtorOption[]> = this.debtsRaw$.pipe(
    map((debts) => {
      const mapById = new Map<string, DebtorOption>();
      for (const debt of debts) {
        if (debt.debtor?._id && !mapById.has(debt.debtor._id)) {
          mapById.set(debt.debtor._id, {
            _id: debt.debtor._id,
            name: debt.debtor.displayName,
          });
        }
      }
      return Array.from(mapById.values());
    }),
    tap((list) => (this._lastDebtorsSnapshot = list)),
    shareReplay({ refCount: true }),
  );

  /** First selected debtor name (for mat-select-trigger) */
  public get firstSelectedDebtorName(): string {
    if (!this._lastDebtorsSnapshot || this.selectedDebtors.length === 0) return '';
    const first = this._lastDebtorsSnapshot.find((d) => d._id === this.selectedDebtors[0]);
    return first?.name ?? '';
  }

  /** Final filtered debts */
  public filteredDebts$: Observable<DebtColumns> = combineLatest([
    this.debtsRaw$,
    this.sortSelection$,
    this.debtorSelection$,
  ]).pipe(
    map(([debts, sort, debtorIds]) => {
      const filtered = debtorIds.length
        ? debts.filter((debt) => debt.debtor && debtorIds.includes(debt.debtor._id))
        : debts;

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
  public trackByDebtId(index: number, debt: IDebt): string {
    return debt._id;
  }
}
