import type { Routes } from '@angular/router';
import { DebtListPage } from './pages/debt-list/debt-list';
import { DebtFormPage } from './pages/debt-form/debt-form';
import { DebtDetailPage } from './pages/debt-detail/debt-detail';
import { RegisterPage } from './pages/register/register';
import { LoginPage } from './pages/login/login';
import { HomePage } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'home', component: HomePage },
  { path: 'debts', component: DebtListPage },
  { path: 'debts/new', component: DebtFormPage },
  { path: 'debts/:debtId/edit', component: DebtFormPage },
  { path: 'debts/:debtId', component: DebtDetailPage },
  { path: 'register', component: RegisterPage },
  { path: 'login', component: LoginPage },
];
