import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { IDebt } from '../../types/debt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debt-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './debt-card.html',
  styleUrls: ['./debt-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCard {
  private router = inject(Router);

  @Input() debt!: IDebt;

  @Input() mode: 'creditor' | 'debtor' = 'creditor';

  statusIcons = {
    paid: { icon: 'check', fontSet: 'material-icons' },
    unpaid: { icon: 'progress_activity', fontSet: 'material-symbols-outlined' },
    overdue: { icon: 'skull', fontSet: 'material-symbols-outlined' },
  };

  get counterpartyName(): string {
    if (this.mode === 'creditor') {
      if (typeof this.debt.debtor === 'string') {
        return this.debt.debtor;
      } else if (this.debt.debtor?.displayName) {
        return this.debt.debtor.displayName;
      } else {
        return 'Unnamed';
      }
    } else {
      if (typeof this.debt.creditor === 'string') {
        return this.debt.creditor;
      } else if (this.debt.creditor?.displayName) {
        return this.debt.creditor.displayName;
      } else {
        return 'Unnamed';
      }
    }
  }

  onCardClick(): void {
    if (!this.debt?._id) {
      return;
    }
    this.router.navigate(['/debts', this.debt._id]);
  }
}
