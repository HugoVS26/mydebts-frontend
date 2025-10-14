import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { IDebt } from '../../models/debt.model';

@Component({
  selector: 'app-debt-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './debt-card.html',
  styleUrls: ['./debt-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCardComponent {
  @Input() public debt!: IDebt;

  @Input() public mode: 'creditor' | 'debtor' = 'creditor';

  public statusIcons = {
    paid: { icon: 'check', fontSet: 'material-icons' },
    unpaid: { icon: 'progress_activity', fontSet: 'material-symbols-outlined' },
    overdue: { icon: 'skull', fontSet: 'material-symbols-outlined' },
  };

  public get counterpartyName(): string {
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
}
