import type { IDebt } from '../types/debt';

export const debtMock: IDebt = {
  _id: '1',
  debtor: 'John Doe',
  creditor: '68adda76e019d1a45a6ae1fe',
  amount: 150.75,
  description: 'Lunch payment',
  debtDate: '2025-01-01',
  dueDate: '2025-01-15',
  status: 'unpaid',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:00:00Z',
};

export const debtsMock: IDebt[] = [
  {
    _id: '1',
    debtor: 'John Doe',
    creditor: '68adda76e019d1a45a6ae1fe',
    amount: 150.75,
    description: 'Lunch payment',
    debtDate: '2025-01-01',
    dueDate: '2025-01-15',
    status: 'unpaid',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    _id: '2',
    debtor: 'Alice Johnson',
    creditor: '68adda76e019d1a45a6ae1fe',
    amount: 75.5,
    description: 'Coffee and snacks',
    debtDate: '2025-02-10',
    dueDate: '2025-02-12',
    status: 'paid',
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-02-12T14:00:00Z',
  },
  {
    _id: '3',
    debtor: 'Bob Williams',
    creditor: '68adda76e019d1a45a6ae1fe',
    amount: 200,
    description: 'Project reimbursement',
    debtDate: '2025-03-01',
    dueDate: '2025-03-05',
    status: 'overdue',
    createdAt: '2025-03-01T08:30:00Z',
    updatedAt: '2025-03-05T10:15:00Z',
  },
  {
    _id: '4',
    debtor: '68adda76e019d1a45a6ae1fe',
    creditor: 'George King',
    amount: 300,
    description: 'Utility bill split',
    debtDate: '2025-04-01',
    dueDate: '2025-04-10',
    status: 'unpaid',
    createdAt: '2025-04-01T12:00:00Z',
    updatedAt: '2025-04-03T09:00:00Z',
  },
];

export const createDebtMock = (): IDebt => ({
  _id: '1',
  debtor: 'John Doe',
  creditor: '68adda76e019d1a45a6ae1fe',
  amount: 150.75,
  description: 'Lunch payment',
  debtDate: '2025-01-01',
  dueDate: '2025-01-15',
  status: 'unpaid',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:00:00Z',
});

export const unpaidDebtsMock: IDebt[] = debtsMock.filter((d) => d.status === 'unpaid');
