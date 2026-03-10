import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/features/auth/services/auth';
import { ThemeModeService } from 'src/app/core/services/theme-mode';
import { DebtModeService } from 'src/app/features/debts/services/debt-mode';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatSlideToggleModule, RouterLink, MatMenuModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeModeService);
  readonly debtModeService = inject(DebtModeService);
  readonly isLightMode = this.themeService.isLightMode;

  isMenuOpen = signal(false);

  readonly navLinks = [
    { path: '/debts', label: 'Debts' },
    { path: '/debts/new', label: 'New Debt', queryPams: { mode: this.debtModeService.mode() } },
  ];

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
