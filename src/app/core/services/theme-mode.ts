import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'theme';
const LIGHT = 'light-theme';
const DARK = 'dark-theme';

@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  private _isLightMode = signal(this.getSavedTheme());
  readonly isLightMode = this._isLightMode.asReadonly();

  constructor() {
    this.apply();
  }

  private getSavedTheme(): boolean {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === null) return false;
    return saved === LIGHT;
  }

  apply(): void {
    const isLight = this._isLightMode();
    document.documentElement.classList.toggle(LIGHT, isLight);
    document.documentElement.classList.toggle(DARK, !isLight);
  }

  toggle(): void {
    this._isLightMode.update((light) => !light);
    localStorage.setItem(THEME_KEY, this._isLightMode() ? LIGHT : DARK);
    this.apply();
  }
}
