import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DebtsModule } from './features/debts/debts-module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DebtsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('MyDebts');
}
