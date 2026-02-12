import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';

import { DebtCard } from 'src/app/features/debts/components/debt-card/debt-card';
import type { IDebt } from 'src/app/features/debts/types/debt';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PublicNavbar, MatCardModule, MatIconModule, RouterLink, MatAnchor, DebtCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly exampleDebts: Record<'unpaid' | 'paid' | 'overdue', IDebt> = {
    unpaid: {
      _id: 'example-1',
      description: 'Netflix sharing fee',
      amount: 8.5,
      status: 'unpaid',
      debtor: 'debtor',
      creditor: 'Mom',
      debtDate: '2024-02-10',
      dueDate: '2024-03-15',
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-10T10:00:00Z',
    },
    overdue: {
      _id: 'example-2',
      description: 'Uber from Mordor',
      amount: 999,
      status: 'overdue',
      debtor: 'debtor',
      creditor: 'Gandalf',
      debtDate: '2024-02-20',
      dueDate: '2024-02-28',
      createdAt: '2024-02-20T14:30:00Z',
      updatedAt: '2024-02-28T18:45:00Z',
    },
    paid: {
      _id: 'example-3',
      description: 'Pizza Party',
      amount: 14.5,
      status: 'paid',
      debtor: 'Michellangelo',
      creditor: 'creditor',
      debtDate: '2024-01-15',
      dueDate: '2024-02-01',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-01T12:00:00Z',
    },
  };
}
