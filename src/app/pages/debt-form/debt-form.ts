import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Navbar } from 'src/app/shared/components/navbar/navbar';

import { DebtForm } from 'src/app/features/debts/components/debt-form/debt-form';
import { DebtsService } from 'src/app/features/debts/services/debts';
import type { IDebt, IDebtCreate, IDebtUpdate } from 'src/app/features/debts/types/debt';

@Component({
  selector: 'app-debt-form-page',
  imports: [DebtForm, Navbar],
  templateUrl: './debt-form.html',
  styleUrl: './debt-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtFormPage implements OnInit {
  private debtsService = inject(DebtsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<'create' | 'update'>('create');
  initialData = signal<IDebt | undefined>(undefined);
  errorMessage = signal<string | null>(null);
  isReady = signal(false);
  isLoading = signal(false);
  private debtId: string | null = null;

  ngOnInit(): void {
    this.debtId = this.route.snapshot.paramMap.get('debtId');

    if (this.debtId) {
      this.mode.set('update');
      this.loadDebt(this.debtId);
    } else {
      this.isReady.set(true);
    }
  }

  private loadDebt(debtId: string): void {
    this.debtsService.getDebtById(debtId).subscribe({
      next: (response) => {
        this.initialData.set(response.debt);
        this.isReady.set(true);
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  handleFormSubmit(data: IDebtCreate | IDebtUpdate): void {
    this.isLoading.set(true);

    const request$ =
      this.mode() === 'create'
        ? this.debtsService.createDebt(data as IDebtCreate)
        : this.debtsService.updateDebt(this.debtId!, data as IDebtUpdate);

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        const route = this.mode() === 'create' ? '/' : `/debts/${this.debtId}`;
        this.router.navigate([route]);
      },
      error: () => {
        this.errorMessage.set('Something went wrong. Please try again.');
      },
    });
  }

  handleFormCancel(): void {
    const route = this.debtId ? `/debts/${this.debtId}` : '/';
    this.router.navigate([route]);
  }
}
