import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, finalize, timer } from 'rxjs';
import { ServerWakeService } from '../services/server-wake';

const SLOW_THRESHOLD_MS = 3000;
const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 10;

export const serverWakeInterceptor: HttpInterceptorFn = (req, next) => {
  const serverWake = inject(ServerWakeService);

  const wakeTimeout = setTimeout(() => {
    serverWake.setWaking(true);
  }, SLOW_THRESHOLD_MS);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error) => {
        if (error.status === 0) {
          return timer(RETRY_DELAY_MS);
        }
        throw error;
      },
    }),
    finalize(() => {
      clearTimeout(wakeTimeout);
      serverWake.setWaking(false);
    }),
  );
};
