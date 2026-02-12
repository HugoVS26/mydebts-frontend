import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './public-navbar.html',
  styleUrl: './public-navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicNavbar implements OnInit {
  private router = inject(Router);

  isLightMode = signal(false);
  isMenuOpen = signal(false);

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
}
