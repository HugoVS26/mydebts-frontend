import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SwipeService {
  private touchStartX = 0;
  private readonly THRESHOLD = 50;

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  getSwipeDirection(e: TouchEvent): 'left' | 'right' | null {
    const delta = this.touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(delta) < this.THRESHOLD) return null;
    return delta > 0 ? 'left' : 'right';
  }
}
