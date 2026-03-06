import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import 'github-corner-element';
import { ThemeModeService } from 'src/app/core/services/theme-mode';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class PublicNavbar {
  private router = inject(Router);
  private themeService = inject(ThemeModeService);

  readonly isLightMode = this.themeService.isLightMode;
  isMenuOpen = signal(false);

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
}
