import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import confetti from 'canvas-confetti';

import { DebtDetail } from '../../features/debts/components/debt-detail/debt-detail';
import { Navbar } from 'src/app/shared/components/navbar/navbar';
import { DebtsService } from 'src/app/features/debts/services/debts';
import { SnackbarService } from 'src/app/core/services/snackbar';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
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
  private dialog = inject(MatDialog);
  private snackbar = inject(SnackbarService);

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
      next: (response) => this.debt.set(response.debt),
      error: () => {
        this.snackbar.error('Could not load debt.');
        this.router.navigate(['/']);
      },
    });
  }

  onEdit(): void {
    this.router.navigate(['/debts', this.debtId, 'edit']);
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete Debt',
        message: `Are you sure you want to delete "${this.debt()?.description}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.debtsService.deleteDebt(this.debtId!).subscribe({
          next: () => {
            this.snackbar.success('Debt deleted successfully!');
            this.router.navigate(['/']);
          },
          error: () => this.snackbar.error('Could not delete debt.'),
        });
      }
    });
  }

  onMarkAsPaid(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Mark as Paid',
        message: `Mark "${this.debt()?.description}" as paid?`,
        confirmText: 'Mark as Paid',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.debtsService.markDebtAsPaid(this.debtId!).subscribe({
          next: () => {
            confetti({ particleCount: 100, angle: -90, spread: 70, origin: { y: 0 } });
            this.snackbar.success('Debt marked as paid! 🎉');
            setTimeout(() => window.location.reload(), 1500);
          },
          error: () => this.snackbar.error('Could not mark debt as paid.'),
        });
      }
    });
  }
}
