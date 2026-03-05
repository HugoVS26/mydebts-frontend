import { Injectable, inject } from '@angular/core';
import type { MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  private get horizontalPosition(): MatSnackBarHorizontalPosition {
    return this.breakpointObserver.isMatched('(max-width: 1024px)') ? 'center' : 'right';
  }

  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar--success'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: 'bottom',
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['snackbar--error'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: 'bottom',
    });
  }
}
