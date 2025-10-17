import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DebtForm } from 'src/app/features/debts/components/debt-form/debt-form';
import { DebtsService } from 'src/app/features/debts/services/debts';
import type { IDebt, IDebtCreate, IDebtUpdate } from 'src/app/features/debts/types/debt';

@Component({
  selector: 'app-debt-form-page',
  imports: [DebtForm],
  templateUrl: './debt-form.html',
  styleUrl: './debt-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtFormPage implements OnInit {
  private debtsService = inject(DebtsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public mode = signal<'create' | 'update'>('create');
  public initialData = signal<IDebt | undefined>(undefined);
  private debtId: string | null = null;

  public ngOnInit(): void {
    this.debtId = this.route.snapshot.paramMap.get('debtId');

    if (this.debtId) {
      this.mode.set('update');
      this.loadDebt(this.debtId);
    }
  }

  private loadDebt(debtId: string): void {
    this.debtsService.getDebtById(debtId).subscribe({
      next: (response) => {
        this.initialData.set(response.debt);
      },
      error: (error) => {
        console.error('Error loading debt:', error);
        this.router.navigate(['/']);
      },
    });
  }

  public handleFormSubmit(data: IDebtCreate | IDebtUpdate): void {
    if (this.mode() === 'create') {
      this.debtsService.createDebt(data as IDebtCreate).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating debt:', error);
          console.error('Full error response:', error.error);
        },
      });
    } else if (this.debtId) {
      this.debtsService.updateDebt(this.debtId, data as IDebtUpdate).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error updating debt:', error);
          console.error('Full error response:', error.error);
        },
      });
    }
  }

  public handleFormCancel(): void {
    this.router.navigate(['/']);
  }
}
