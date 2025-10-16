import type { User } from '../../users/model/user.model';

export interface IDebt {
  _id: string;
  debtor: User | string;
  creditor: User | string;
  amount: number;
  description: string;
  debtDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface IDebtCreate {
  debtor: string;
  creditor: string;
  description: string;
  amount: number;
  debtDate?: Date;
  dueDate?: Date;
}

export interface IDebtUpdate {
  description?: string;
  amount?: number;
  dueDate?: Date;
}

export interface IDebtFilter {
  status?: 'paid' | 'unpaid' | 'overdue';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export type SortField = 'amount' | 'debtDate' | 'dueDate';

export type SortOrder = 'asc' | 'desc';
