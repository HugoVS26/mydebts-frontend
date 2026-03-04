import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ServerWakeService } from 'src/app/core/services/server-wake';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-server-wake-banner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './server-wake-banner.html',
  styleUrl: './server-wake-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerWakeBanner {
  serverWake = inject(ServerWakeService);
}
