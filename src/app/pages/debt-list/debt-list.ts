import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DebtCardList } from 'src/app/features/debts/components/debt-card-list/debt-card-list';

@Component({
  selector: 'app-debt-list-page',
  standalone: true,
  imports: [DebtCardList],
  templateUrl: './debt-list.html',
  styleUrl: './debt-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtListPage {}
