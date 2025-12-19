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
  debtDate?: string;
  dueDate?: string;
}

export interface IDebtUpdate {
  description?: string;
  amount?: number;
  dueDate?: string;
}

export interface IDebtFilter {
  status?: 'paid' | 'unpaid' | 'overdue';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export type SortField = 'amount' | 'debtDate' | 'dueDate';

export type SortOrder = 'asc' | 'desc';
