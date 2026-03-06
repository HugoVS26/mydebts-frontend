import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth';
import { ServerWakeBanner } from './shared/components/server-wake-banner/server-wake-banner';
import { ThemeModeService } from './core/services/theme-mode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ServerWakeBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('MyDebts');

  private themeService = inject(ThemeModeService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.themeService.apply();
    this.authService.loadUserFromToken().subscribe();
  }
}
