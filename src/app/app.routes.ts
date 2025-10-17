import type { Routes } from '@angular/router';
import { DebtListPage } from './pages/debt-list/debt-list';
import { DebtFormPage } from './pages/debt-form/debt-form';

export const routes: Routes = [
  { path: '', component: DebtListPage },
  { path: 'debts', component: DebtListPage },
  { path: 'debts/new', component: DebtFormPage },
  { path: 'debts/:debtId/edit', component: DebtFormPage },
];
