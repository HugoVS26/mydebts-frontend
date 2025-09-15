import type { User } from '../../users/model/user.model';

export interface Debt {
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
