import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from 'src/app/features/auth/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatSlideToggleModule, RouterLink, MatMenuModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLightMode = signal(true);
  isMenuOpen = signal(false);

  readonly navLinks = [
    { path: '/debts', label: 'Debts' },
    { path: '/debts/new', label: 'New Debt' },
  ];

  ngOnInit(): void {
    this.isLightMode.set(document.documentElement.classList.contains('light-theme'));
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  toggleTheme(): void {
    this.isLightMode.update((light) => !light);

    if (this.isLightMode()) {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    }
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
