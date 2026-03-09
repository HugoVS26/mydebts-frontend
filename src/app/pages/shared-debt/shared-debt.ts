import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DebtDetail } from '../../features/debts/components/debt-detail/debt-detail';
import { PublicNavbar } from 'src/app/shared/components/public-navbar/public-navbar';
import { SnackbarService } from 'src/app/core/services/snackbar';
import { SharedDebtService } from 'src/app/features/debts/services/shared-debt';
import type { IDebt } from 'src/app/features/debts/types/debt';

@Component({
  selector: 'app-shared-debt-page',
  standalone: true,
  imports: [
    DebtDetail,
    PublicNavbar,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './shared-debt.html',
  styleUrl: './shared-debt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedDebtPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sharedDebtService = inject(SharedDebtService);
  private snackbar = inject(SnackbarService);

  debt = signal<IDebt | undefined>(undefined);
  expired = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.router.navigate(['/']);
      return;
    }
    this.loadSharedDebt(token);
  }

  private loadSharedDebt(token: string): void {
    this.sharedDebtService.getByToken(token).subscribe({
      next: (debt) => this.debt.set(debt),
      error: () => this.expired.set(true),
    });
  }
}
