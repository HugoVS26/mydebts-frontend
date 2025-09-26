import type { User } from '../../users/model/user.model';

export interface IDebt {
  _id: string;
  debtor: User;
  creditor: User;
  amount: number;
  description: string;
  debtDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'amount' | 'debtDate' | 'dueDate';
export type SortOrder = 'asc' | 'desc';

export interface IDebtFilter {
  status?: 'paid' | 'unpaid' | 'overdue';
  sortField?: SortField;
  sortOrder?: SortOrder;
}
