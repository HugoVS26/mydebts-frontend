import type { Routes } from '@angular/router';
import { DebtListPage } from './pages/debt-list/debt-list';
import { DebtFormPage } from './pages/debt-form/debt-form';
import { DebtDetailPage } from './pages/debt-detail/debt-detail';
import { RegisterPage } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: DebtListPage },
  { path: 'debts', component: DebtListPage },
  { path: 'debts/new', component: DebtFormPage },
  { path: 'debts/:debtId/edit', component: DebtFormPage },
  { path: 'debts/:debtId', component: DebtDetailPage },
  { path: 'register', component: RegisterPage },
];
