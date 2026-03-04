import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth';
import { ServerWakeBanner } from './shared/components/server-wake-banner/server-wake-banner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ServerWakeBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('MyDebts');

  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.loadUserFromToken().subscribe();
  }
}
