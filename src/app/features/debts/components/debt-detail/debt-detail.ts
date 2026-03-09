import { ChangeDetectionStrategy, Component, computed, inject, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';

import { AuthService } from 'src/app/features/auth/services/auth';
import type { IDebt } from '../../types/debt';

interface CounterpartyInfo {
  displayName: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface StatusInfo {
  icon: string;
  fontSet: string;
  label: string;
}

type DebtMode = 'creditor' | 'debtor' | 'public';

@Component({
  selector: 'app-debt-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    DatePipe,
  ],
  templateUrl: './debt-detail.html',
  styleUrl: './debt-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtDetail {
  @Input() debt!: IDebt;
  @Input() readonly = false;

  private readonly authService = inject(AuthService);

  readonly editDebt = output<void>();
  readonly deleteDebt = output<void>();
  readonly markAsPaid = output<void>();
  readonly shareClicked = output<void>();

  private readonly statusConfig = {
    paid: { icon: 'check', fontSet: 'material-icons', label: 'paid' },
    unpaid: { icon: 'progress_activity', fontSet: 'material-symbols-outlined', label: 'unpaid' },
    overdue: { icon: 'skull', fontSet: 'material-symbols-outlined', label: 'overdue' },
  };

  protected readonly mode = computed<DebtMode>(() => {
    if (this.readonly) return 'public';

    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return 'public';

    const creditorId =
      typeof this.debt.creditor === 'string' ? this.debt.creditor : this.debt.creditor._id;

    return currentUserId === creditorId ? 'creditor' : 'debtor';
  });

  get counterparty(): CounterpartyInfo {
    const user = this.mode() === 'creditor' ? this.debt.debtor : this.debt.creditor;

    if (typeof user === 'string') {
      return { displayName: user, email: null, firstName: null, lastName: null };
    }

    return {
      displayName: user?.displayName || 'Unnamed',
      email: user?.email ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
    };
  }

  get debtorName(): string {
    return typeof this.debt.debtor === 'string'
      ? this.debt.debtor
      : this.debt.debtor.displayName || 'Unnamed';
  }

  get creditorName(): string {
    return typeof this.debt.creditor === 'string'
      ? this.debt.creditor
      : this.debt.creditor.displayName || 'Unnamed';
  }

  get statusInfo(): StatusInfo {
    return this.statusConfig[this.debt.status];
  }

  get canMarkAsPaid(): boolean {
    return this.debt.status === 'unpaid' || this.debt.status === 'overdue';
  }

  onEdit(): void {
    this.editDebt.emit();
  }

  onDelete(): void {
    this.deleteDebt.emit();
  }

  onMarkAsPaid(): void {
    this.markAsPaid.emit();
  }

  onShare(): void {
    this.shareClicked.emit();
  }
}
