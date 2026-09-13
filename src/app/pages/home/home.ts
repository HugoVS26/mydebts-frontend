import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { DebtCard } from 'src/app/features/debts/components/debt-card/debt-card';
import type { IDebt } from 'src/app/features/debts/types/debt';

const HOME_BODY_CLASS = 'home-page';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [PublicNavbar, MatIconModule, RouterLink, MatButtonModule, DebtCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);

  readonly currentYear = new Date().getFullYear();

  readonly trustItems = [
    { icon: 'lock', label: 'No bank connection' },
    { icon: 'code', label: 'Open source' },
    { icon: 'euro', label: 'Free' },
  ];

  readonly steps = [
    {
      num: '01',
      icon: 'edit_note',
      title: 'Write it down',
      description:
        'Who, how much, and what it was for. Takes ten seconds and you will keep your debts under control.',
    },
    {
      num: '02',
      icon: 'share',
      title: 'Share it',
      description:
        'Send the note to the other person, so nobody gets to "remember it differently".',
    },
    {
      num: '03',
      icon: 'check',
      title: 'Mark it paid',
      description: 'One tap turns the note green. Friendship restored, no spreadsheet harmed.',
    },
  ];

  readonly exampleDebts: Record<'unpaid' | 'paid' | 'overdue', IDebt> = {
    unpaid: {
      _id: 'example-1',
      description: 'Netflix sharing fee',
      amount: 8.5,
      status: 'unpaid',
      debtor: 'debtor',
      creditor: 'Mom',
      debtDate: '2024-02-10',
      createdAt: '2024-02-10T10:00:00Z',
      updatedAt: '2024-02-10T10:00:00Z',
    },
    overdue: {
      _id: 'example-2',
      description: 'Saturday night Uber',
      amount: 20,
      status: 'overdue',
      debtor: 'debtor',
      creditor: 'Mike',
      debtDate: '2026-02-20',
      dueDate: '2026-02-28',
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
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-01T12:00:00Z',
    },
  };

  ngOnInit(): void {
    this.document.body.classList.add(HOME_BODY_CLASS);
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove(HOME_BODY_CLASS);
  }
}
