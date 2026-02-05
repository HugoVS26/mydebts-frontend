import type { IDebt } from '../types/debt';
import type { User } from '../../auth/types/user';

export const currentUserMock: User = {
  _id: '68adda76e019d1a45a6ae1fe',
  firstName: 'Current',
  lastName: 'User',
  displayName: 'Current User',
  email: 'current@example.com',
  role: 'user',
};

const johnDoe: User = {
  _id: '2',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  email: 'john@example.com',
  role: 'user',
};

const aliceJohnson: User = {
  _id: '3',
  firstName: 'Alice',
  lastName: 'Johnson',
  displayName: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'user',
};

const bobWilliams: User = {
  _id: '4',
  firstName: 'Bob',
  lastName: 'Williams',
  displayName: 'Bob Williams',
  email: 'bob@example.com',
  role: 'user',
};

const georgeKing: User = {
  _id: '5',
  firstName: 'George',
  lastName: 'King',
  displayName: 'George King',
  email: 'george@example.com',
  role: 'user',
};

export const debtMock: IDebt = {
  _id: '1',
  debtor: johnDoe,
  creditor: currentUserMock,
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
    debtor: johnDoe,
    creditor: currentUserMock,
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
    debtor: aliceJohnson,
    creditor: currentUserMock,
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
    debtor: bobWilliams,
    creditor: currentUserMock,
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
    debtor: currentUserMock,
    creditor: georgeKing,
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
  debtor: johnDoe,
  creditor: currentUserMock,
  amount: 150.75,
  description: 'Lunch payment',
  debtDate: '2025-01-01',
  dueDate: '2025-01-15',
  status: 'unpaid',
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-01T10:00:00Z',
});

export const unpaidDebtsMock: IDebt[] = debtsMock.filter((d) => d.status === 'unpaid');
