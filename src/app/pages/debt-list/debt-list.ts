import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';

import { DebtCardList } from 'src/app/features/debts/components/debt-card-list/debt-card-list';
import { Navbar } from 'src/app/shared/components/navbar/navbar';

const DEBTS_BODY_CLASS = 'debts-page';

@Component({
  selector: 'app-debt-list-page',
  standalone: true,
  imports: [DebtCardList, Navbar],
  templateUrl: './debt-list.html',
  styleUrl: './debt-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtListPage implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);

  ngOnInit(): void {
    this.document.body.classList.add(DEBTS_BODY_CLASS);
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove(DEBTS_BODY_CLASS);
  }
}
