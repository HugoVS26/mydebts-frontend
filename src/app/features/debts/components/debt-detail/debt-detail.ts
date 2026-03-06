import { ChangeDetectionStrategy, Component, computed, inject, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { DebtsService } from '../../services/debts';
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

  private readonly debtsService = inject(DebtsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly editDebt = output<void>();
  readonly deleteDebt = output<void>();
  readonly markAsPaid = output<void>();

  private readonly statusConfig = {
    paid: { icon: 'check', fontSet: 'material-icons', label: 'paid' },
    unpaid: { icon: 'progress_activity', fontSet: 'material-symbols-outlined', label: 'unpaid' },
    overdue: { icon: 'skull', fontSet: 'material-symbols-outlined', label: 'overdue' },
  };

  protected readonly mode = computed<'creditor' | 'debtor'>(() => {
    const currentUserId = this.authService.currentUser()?._id;
    if (!currentUserId) return 'creditor';

    const creditorId =
      typeof this.debt.creditor === 'string' ? this.debt.creditor : this.debt.creditor._id;

    return currentUserId === creditorId ? 'creditor' : 'debtor';
  });

  get counterparty(): CounterpartyInfo {
    const user = this.mode() === 'creditor' ? this.debt.debtor : this.debt.creditor;

    if (typeof user === 'string') {
      return {
        displayName: user,
        email: null,
        firstName: null,
        lastName: null,
      };
    }

    return {
      displayName: user?.displayName || 'Unnamed',
      email: user?.email ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
    };
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
}
