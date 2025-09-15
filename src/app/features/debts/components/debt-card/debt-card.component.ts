import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { Debt } from '../../models/debt.model';

@Component({
  selector: 'app-debt-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './debt-card.component.html',
  styleUrls: ['./debt-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtCardComponent {
  @Input() public debt!: Debt;

  public statusIcons = {
    paid: { icon: 'check', fontSet: 'material-icons' },
    unpaid: { icon: 'progress_activity', fontSet: 'material-symbols-outlined' },
    overdue: { icon: 'skull', fontSet: 'material-symbols-outlined' },
  };
}
