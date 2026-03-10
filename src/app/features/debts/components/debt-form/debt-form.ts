import { CommonModule } from '@angular/common';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
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
import { AuthService } from 'src/app/features/auth/services/auth';
import { MatIcon } from '@angular/material/icon';
import { DebtModeService } from '../../services/debt-mode';

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
    MatIcon,
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
  @Input() mode: 'create' | 'update' = 'create';
  @Input() initialData?: IDebt;

  @Output() formSubmit = new EventEmitter<IDebtCreate | IDebtUpdate>();
  @Output() formCancel = new EventEmitter<void>();

  form: FormGroup;
  debtMode = signal<'creditor' | 'debtor'>('creditor');
  errorMessage = input<string | null>(null);
  formReady = signal(false);
  isLoading = input<boolean>(false);

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private initialFormValues: Partial<DebtFormValues> = {};
  private debtModeService = inject(DebtModeService);

  private readonly namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/;

  constructor() {
    this.form = this.formBuilder.group({
      _placeholder: [''],
    });
  }

  ngOnInit(): void {
    this.debtMode.set(this.debtModeService.mode());
    this.initForm();
    this.formReady.set(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && !changes['initialData'].firstChange && this.formReady()) {
      this.formReady.set(false);
      this.initForm();
      this.formReady.set(true);
    }
  }

  /** Form initialization */
  private initForm(): void {
    const isCreateMode = this.mode === 'create';

    const baseControls = {
      description: [
        this.initialData?.description ?? '',
        isCreateMode
          ? [Validators.required, Validators.minLength(1), Validators.maxLength(100)]
          : [Validators.minLength(1), Validators.maxLength(100)],
      ],
      amount: [
        this.initialData?.amount?.toString() ?? null,
        isCreateMode
          ? [Validators.required, this.numericAmountValidator()]
          : [this.numericAmountValidator()],
      ],
      dueDate: [this.initialData?.dueDate ? new Date(this.initialData.dueDate) : null],
    };

    const createModeControls = isCreateMode
      ? {
          counterparty: [
            '',
            [
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(50),
              Validators.pattern(this.namePattern),
            ],
          ],
          debtDate: [new Date(), [this.pastOrTodayDateValidator()]],
        }
      : {};

    this.form = this.formBuilder.group({
      ...baseControls,
      ...createModeControls,
    });

    const referenceDebtDate = this.initialData?.debtDate
      ? new Date(this.initialData.debtDate)
      : new Date();

    if (!isCreateMode) {
      this.form.get('dueDate')?.setValidators([this.dueDateValidator(referenceDebtDate)]);
    } else {
      this.form
        .get('dueDate')
        ?.setValidators([this.dueDateValidator(this.form.get('debtDate')?.value)]);

      this.form.get('debtDate')?.valueChanges.subscribe(() => {
        this.form.get('dueDate')?.updateValueAndValidity();
      });
    }

    if (!isCreateMode) {
      this.initialFormValues = { ...this.form.value };
      this.form.setValidators(this.atLeastOneFieldChangedValidator());
    }
  }

  /** Validators */
  private numericAmountValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const parsed = parseFloat(control.value);
      if (isNaN(parsed)) return { invalidAmount: true };
      if (parsed < 0.01) return { min: true };
      if (parsed > 10_000_000) return { max: true };
      return null;
    };
  }

  private pastOrTodayDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return control.value <= today ? null : { futureDate: true };
    };
  }

  private dueDateValidator(referenceDate: Date) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const compareDate =
        this.mode === 'create' ? this.form?.get('debtDate')?.value : referenceDate;

      if (!compareDate) return null;

      const dueDateOnly = new Date(control.value);
      dueDateOnly.setHours(0, 0, 0, 0);

      const debtDateOnly = new Date(compareDate);
      debtDateOnly.setHours(0, 0, 0, 0);

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
  onSubmit(): void {
    if (this.form.invalid) return;

    const currentUserId = this.authService.currentUserId;
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    const { counterparty, description, amount, debtDate, dueDate } = this.form.value;
    const parsedAmount = parseFloat(amount);

    if (this.mode === 'create') {
      const payload: IDebtCreate =
        this.debtMode() === 'creditor'
          ? {
              debtor: counterparty,
              creditor: currentUserId,
              description,
              amount: parsedAmount,
              debtDate: this.formatDateToYYYYMMDD(debtDate),
              dueDate: dueDate ? this.formatDateToYYYYMMDD(dueDate) : undefined,
            }
          : {
              debtor: currentUserId,
              creditor: counterparty,
              description,
              amount: parsedAmount,
              debtDate: this.formatDateToYYYYMMDD(debtDate),
              dueDate: dueDate ? this.formatDateToYYYYMMDD(dueDate) : undefined,
            };

      this.formSubmit.emit(payload);
    } else {
      const payload: IDebtUpdate = {};

      if (description !== this.initialFormValues.description) {
        payload.description = description;
      }
      if (parsedAmount !== this.initialFormValues.amount) {
        payload.amount = parsedAmount;
      }
      if (dueDate?.getTime() !== this.initialFormValues.dueDate?.getTime()) {
        payload.dueDate = this.formatDateToYYYYMMDD(dueDate);
      }

      this.formSubmit.emit(payload);
    }
  }

  /** Formats */
  private formatDateToYYYYMMDD(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');

    value = value.replace(/^0+(\d)/, '0');

    input.value = value;
    this.form.get('amount')?.setValue(value === '' ? null : value, { emitEvent: true });
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  /** Getters */
  get counterpartyLabel(): string {
    return this.debtMode() === 'creditor' ? 'Debtor' : 'Creditor';
  }

  get counterpartyPlaceholder(): string {
    return this.debtMode() === 'creditor'
      ? 'Enter the name of who owes you'
      : 'Enter the name of who you owe';
  }

  get hasNoChanges(): boolean {
    return this.mode === 'update' && this.form.hasError('noChanges');
  }

  onDebtModeChange(mode: 'creditor' | 'debtor'): void {
    this.debtMode.set(mode);
    this.debtModeService.setMode(mode);
  }
}
