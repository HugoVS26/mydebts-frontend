import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DebtDetail } from '../../features/debts/components/debt-detail/debt-detail';
import { Navbar } from 'src/app/shared/components/navbar/navbar';

import { DebtsService } from 'src/app/features/debts/services/debts';
import type { IDebt } from 'src/app/features/debts/types/debt';

@Component({
  selector: 'app-debt-detail-page',
  standalone: true,
  imports: [DebtDetail, Navbar],
  templateUrl: './debt-detail.html',
  styleUrl: './debt-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtDetailPage implements OnInit {
  private debtsService = inject(DebtsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  debt = signal<IDebt | undefined>(undefined);
  private debtId: string | null = null;

  ngOnInit(): void {
    this.debtId = this.route.snapshot.paramMap.get('debtId');

    if (this.debtId) {
      this.loadDebt(this.debtId);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadDebt(debtId: string): void {
    this.debtsService.getDebtById(debtId).subscribe({
      next: (response) => {
        this.debt.set(response.debt);
      },
      error: (error) => {
        console.error('Error loading debt:', error);
        this.router.navigate(['/']);
      },
    });
  }
}
