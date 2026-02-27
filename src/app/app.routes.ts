import type { Routes } from '@angular/router';
import { DebtListPage } from './pages/debt-list/debt-list';
import { DebtFormPage } from './pages/debt-form/debt-form';
import { DebtDetailPage } from './pages/debt-detail/debt-detail';
import { RegisterPage } from './pages/register/register';
import { LoginPage } from './pages/login/login';
import { HomePage } from './pages/home/home';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password';
import { authGuard } from './core/guards/auth/auth.guard';
import { guestGuard } from './core/guards/guest/guest.guard';
import { ResetPasswordPage } from './pages/reset-password/reset-password';
import { NotFoundPage } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: HomePage, canActivate: [guestGuard] },
  { path: 'home', component: HomePage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPage, canActivate: [guestGuard] },

  {
    path: 'debts',
    canActivate: [authGuard],
    children: [
      { path: '', component: DebtListPage },
      { path: 'new', component: DebtFormPage },
      { path: ':debtId/edit', component: DebtFormPage },
      { path: ':debtId', component: DebtDetailPage },
    ],
  },

  { path: '**', component: NotFoundPage },
];
