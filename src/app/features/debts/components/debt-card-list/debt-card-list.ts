import { ChangeDetectionStrategy, Component, inject, computed, ViewChild } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { BehaviorSubject, combineLatest, map, shareReplay, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';

import type { IDebt } from '../../types/debt';
import { DebtCard } from '../debt-card/debt-card';
import { DebtsService } from '../../services/debts';
import { AuthService } from '../../../auth/services/auth';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
import { SnackbarService } from 'src/app/core/services/snackbar';
import { RouterLink } from '@angular/router';
import { DebtModeService } from '../../services/debt-mode';
import { SwipeService } from 'src/app/core/services/swipe';
export interface DebtColumns {
  unpaid: IDebt[];
  paid: IDebt[];
  overdue: IDebt[];
}

export type DebtStatus = keyof DebtColumns;

interface StatusSummary {
  count: number;
  amount: number;
}

export interface DebtSummary {
  /** Outstanding amount: unpaid + overdue */
  total: number;
  unpaid: StatusSummary;
  overdue: StatusSummary;
  paid: StatusSummary;
}

interface ColumnMeta {
  status: DebtStatus;
  title: string;
  icon: string;
  emptyIcon: string;
  /** One entry per line in the empty state */
  emptyMessage: string[];
}

interface DebtorOption {
  _id?: string;
  name: string;
}

/** `shortLabel` is what the compact mobile sort chip shows. */
const SORT_OPTIONS = [
  { value: 'creationDateDesc', label: 'Creation date · Newest', shortLabel: 'Newest first' },
  { value: 'creationDateAsc', label: 'Creation date · Oldest', shortLabel: 'Oldest first' },
  { value: 'amountAsc', label: 'Amount · Lowest', shortLabel: 'Lowest amount' },
  { value: 'amountDesc', label: 'Amount · Highest', shortLabel: 'Highest amount' },
  { value: 'debtDateAsc', label: 'Debt date · Earliest', shortLabel: 'Earliest debt date' },
  { value: 'debtDateDesc', label: 'Debt date · Latest', shortLabel: 'Latest debt date' },
  { value: 'dueDateAsc', label: 'Due date · Earliest', shortLabel: 'Earliest due date' },
  { value: 'dueDateDesc', label: 'Due date · Latest', shortLabel: 'Latest due date' },
];

/** Board columns, in display order (desktop columns and mobile tabs). */
const COLUMNS: ColumnMeta[] = [
  {
    status: 'unpaid',
    title: 'Unpaid',
    icon: 'hourglass_top',
    emptyIcon: 'sticky_note_2',
    emptyMessage: ['No unpaid debts.', 'Enjoy the peace while it lasts'],
  },
  {
    status: 'overdue',
    title: 'Overdue',
    icon: 'skull',
    emptyIcon: 'thumb_up',
    emptyMessage: ['No overdue debts.', 'Good job staying on top of things!'],
  },
  {
    status: 'paid',
    title: 'Paid',
    icon: 'check',
    emptyIcon: 'task_alt',
    emptyMessage: ['No paid debts found.', "Looks like you're all caught up!"],
  },
];

const TOTAL_TABS = COLUMNS.length;
@Component({
  selector: 'app-debt-card-list',
  standalone: true,
  imports: [
    DebtCard,
    AsyncPipe,
    DecimalPipe,
    NgTemplateOutlet,
    MatButtonModule,
    MatIcon,
    MatSelectModule,
    RouterLink,
    MatTabsModule,
    MatTabGroup,
  ],
  templateUrl: './debt-card-list.html',
  styleUrls: ['./debt-card-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCardList {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  private debtsService = inject(DebtsService);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private snackbar = inject(SnackbarService);
  private debtModeService = inject(DebtModeService);
  private readonly swipeService = inject(SwipeService);
  private currentUserId = computed(() => this.authService.currentUser()?._id ?? null);

  isDesktop$: Observable<boolean> = this.breakpointObserver.observe(['(min-width: 1024px)']).pipe(
    map((result) => result.matches),
    shareReplay({ refCount: true }),
  );

  columns = COLUMNS;

  /** Toggle mode for creditor or debtor */
  private mode$ = toObservable(this.debtModeService.mode);

  get mode(): 'creditor' | 'debtor' {
    return this.debtModeService.mode();
  }

  toggleMode(mode: 'creditor' | 'debtor'): void {
    this.debtModeService.setMode(mode);
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

  get selectedSortShortLabel(): string {
    return SORT_OPTIONS.find((option) => option.value === this.selectedSort)?.shortLabel ?? '';
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
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return +new Date(a.dueDate) - +new Date(b.dueDate);
        case 'dueDateDesc':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
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

        const _id = typeof otherUser === 'string' ? otherUser : (otherUser._id ?? 'unknown');
        const name =
          typeof otherUser === 'string' ? otherUser : (otherUser.displayName ?? 'Unnamed');

        if (!otherUser || _id === currentUserId) continue;

        if (!mapById.has(_id)) mapById.set(_id, { _id, name });
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

  /** Totals per status for the summary strip (follows the active filters) */
  summary$: Observable<DebtSummary> = this.filteredDebts$.pipe(
    map((columns) => {
      const summarize = (debts: IDebt[]): StatusSummary => ({
        count: debts.length,
        amount: debts.reduce((sum, debt) => sum + debt.amount, 0),
      });
      const unpaid = summarize(columns.unpaid);
      const overdue = summarize(columns.overdue);
      const paid = summarize(columns.paid);

      return { total: unpaid.amount + overdue.amount, unpaid, overdue, paid };
    }),
    shareReplay({ refCount: true }),
  );

  onDeleteAllPaid(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Clear Paid Debts',
        message: `Are you sure you want to delete all paid debts where you are ${this.mode}?`,
        confirmText: 'Delete All',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.debtsService.deleteAllPaidDebts(this.mode).subscribe({
          next: () => {
            this.snackbar.success('All paid debts deleted successfully!');
            window.location.reload();
          },
          error: () => this.snackbar.error('Could not delete paid debts.'),
        });
      }
    });
  }

  onTouchStart(e: TouchEvent): void {
    this.swipeService.onTouchStart(e);
  }

  onTouchEnd(e: TouchEvent): void {
    const direction = this.swipeService.getSwipeDirection(e);
    if (!direction) return;

    const current = this.tabGroup.selectedIndex ?? 0;

    if (direction === 'left' && current < TOTAL_TABS - 1) {
      this.tabGroup.selectedIndex = current + 1;
    } else if (direction === 'right' && current > 0) {
      this.tabGroup.selectedIndex = current - 1;
    }
  }

  /** Helpers */
  debtsFor(debts: DebtColumns | null, status: DebtStatus): IDebt[] {
    return debts?.[status] ?? [];
  }

  trackByDebtId(index: number, debt: IDebt): string {
    return debt._id;
  }
}
