import { CommonModule } from '@angular/common';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { type FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

import type { IDebt, IDebtCreate, IDebtUpdate } from '../../types/debt';

interface DebtFormValues {
  counterparty: string;
  description: string;
  amount: number;
  debtDate: Date;
  dueDate: Date | null;
}

@Component({
  selector: 'app-debt-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
  templateUrl: './debt-form.html',
  styleUrl: './debt-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtForm implements OnInit, OnChanges {
  @Input() public mode: 'create' | 'update' = 'create';
  @Input() public initialData?: IDebt;

  @Output() public formSubmit = new EventEmitter<IDebtCreate | IDebtUpdate>();
  @Output() public formCancel = new EventEmitter<void>();

  public form!: FormGroup;
  public debtMode = signal<'creditor' | 'debtor'>('creditor');

  private formBuilder = inject(FormBuilder);
  private initialFormValues: Partial<DebtFormValues> = {};

  public ngOnInit(): void {
    this.initForm();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      this.initForm();
    }
  }

  /** Form initialization */
  private initForm(): void {
    const isCreateMode = this.mode === 'create';

    this.form = this.formBuilder.group({
      counterparty: ['', isCreateMode ? [Validators.required, Validators.minLength(1)] : []],
      description: [
        this.initialData?.description ?? '',
        isCreateMode ? [Validators.required, Validators.minLength(1)] : [Validators.minLength(1)],
      ],
      amount: [
        this.initialData?.amount ?? null,
        isCreateMode ? [Validators.required, Validators.min(0.01)] : [Validators.min(0.01)],
      ],
      debtDate: [
        {
          value: this.initialData?.debtDate ? new Date(this.initialData.debtDate) : new Date(),
          disabled: !isCreateMode,
        },
      ],
      dueDate: [this.initialData?.dueDate ? new Date(this.initialData.dueDate) : null],
    });

    // Add dueDate validator based on debtDate
    if (!isCreateMode && this.initialData?.debtDate) {
      this.form
        .get('dueDate')
        ?.setValidators([this.dueDateValidator(new Date(this.initialData.debtDate))]);
    } else if (isCreateMode) {
      this.form
        .get('dueDate')
        ?.setValidators([this.dueDateValidator(this.form.get('debtDate')?.value)]);

      // Update dueDate validator when debtDate changes
      this.form.get('debtDate')?.valueChanges.subscribe(() => {
        this.form.get('dueDate')?.updateValueAndValidity();
      });
    }

    // Store initial values and add validator for update mode
    if (!isCreateMode) {
      this.initialFormValues = { ...this.form.value };
      this.form.setValidators(this.atLeastOneFieldChangedValidator());
    }
  }

  /** Validators */
  private dueDateValidator(referenceDate: Date) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const dueDate = new Date(control.value);
      const compareDate = referenceDate || this.form?.get('debtDate')?.value;

      if (!compareDate) return null;

      const dueDateOnly = new Date(dueDate.setHours(0, 0, 0, 0));
      const debtDateOnly = new Date(new Date(compareDate).setHours(0, 0, 0, 0));

      return dueDateOnly >= debtDateOnly ? null : { beforeDebtDate: true };
    };
  }

  private atLeastOneFieldChangedValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const currentValues = formGroup.value;

      const hasChanges = ['description', 'amount', 'dueDate'].some((key) => {
        const currentValue = currentValues[key as keyof typeof currentValues];
        const initialValue = this.initialFormValues[key as keyof DebtFormValues];

        if (currentValue === null && initialValue === null) return false;
        if (currentValue === undefined && initialValue === undefined) return false;

        if (currentValue instanceof Date && initialValue instanceof Date) {
          return currentValue.getTime() !== initialValue.getTime();
        }

        return currentValue !== initialValue;
      });

      return hasChanges ? null : { noChanges: true };
    };
  }

  /** Form submission */
  public onSubmit(): void {
    if (this.form.invalid) return;

    const { counterparty, description, amount, debtDate, dueDate } = this.form.value;

    if (this.mode === 'create') {
      const currentUserId = '68adda76e019d1a45a6ae1fe';

      const payload: IDebtCreate =
        this.debtMode() === 'creditor'
          ? {
              debtor: counterparty,
              creditor: currentUserId,
              description,
              amount,
              debtDate: debtDate?.toISOString(),
              dueDate: dueDate?.toISOString(),
            }
          : {
              debtor: currentUserId,
              creditor: counterparty,
              description,
              amount,
              debtDate: debtDate?.toISOString(),
              dueDate: dueDate?.toISOString(),
            };

      this.formSubmit.emit(payload);
    } else {
      // Only send changed fields
      const payload: IDebtUpdate = {};

      if (description !== this.initialFormValues.description) {
        payload.description = description;
      }
      if (amount !== this.initialFormValues.amount) {
        payload.amount = amount;
      }
      if (dueDate?.getTime() !== this.initialFormValues.dueDate?.getTime()) {
        payload.dueDate = dueDate?.toISOString();
      }

      this.formSubmit.emit(payload);
    }
  }

  public onCancel(): void {
    this.formCancel.emit();
  }

  /** Getters */
  public get counterpartyLabel(): string {
    return this.debtMode() === 'creditor' ? 'Debtor' : 'Creditor';
  }

  public get counterpartyPlaceholder(): string {
    return this.debtMode() === 'creditor'
      ? 'Enter the name of who owes you'
      : 'Enter the name of who you owe';
  }

  public get hasNoChanges(): boolean {
    return this.mode === 'update' && this.form.hasError('noChanges');
  }
}
