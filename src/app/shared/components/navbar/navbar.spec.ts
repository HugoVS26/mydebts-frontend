import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Navbar } from './navbar';
import { ThemeModeService } from 'src/app/core/services/theme-mode';

describe('Given a Navbar component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let themeService: {
    toggle: ReturnType<typeof vi.fn>;
    isLightMode: ReturnType<typeof signal<boolean>>;
  };

  beforeEach(async () => {
    const isLightModeSignal = signal(false);

    themeService = {
      toggle: vi.fn().mockImplementation(() => isLightModeSignal.update((v) => !v)),
      isLightMode: isLightModeSignal,
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ThemeModeService, useValue: themeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Should have navigation links defined', () => {
      expect(component.navLinks).toHaveLength(2);
      expect(component.navLinks[0]).toEqual({ path: '/debts', label: 'Debts' });
      expect(component.navLinks[1]).toEqual({ path: '/debts/new', label: 'New Debt' });
    });

    it('Should read theme mode from service', () => {
      expect(component.isLightMode()).toBeDefined();
    });
  });

  describe('When checking if route is active', () => {
    it('Should return boolean for matching route', () => {
      const result = component.isActive('/debts');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('When toggling theme', () => {
    it('Should switch from dark to light mode', () => {
      themeService.isLightMode.set(false);

      component.toggleTheme();

      expect(themeService.toggle).toHaveBeenCalled();
      expect(component.isLightMode()).toBe(true);
    });

    it('Should switch from light to dark mode', () => {
      themeService.isLightMode.set(true);

      component.toggleTheme();

      expect(themeService.toggle).toHaveBeenCalled();
      expect(component.isLightMode()).toBe(false);
    });
  });

  describe('When clicking on menu', () => {
    it('Should open menu when closed', () => {
      component.isMenuOpen.set(false);

      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(true);
    });

    it('Should close menu when open', () => {
      component.isMenuOpen.set(true);

      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(false);
    });

    it('Should set menu state to closed', () => {
      component.isMenuOpen.set(true);

      component.closeMenu();

      expect(component.isMenuOpen()).toBe(false);
    });

    it('Should keep menu closed if already closed', () => {
      component.isMenuOpen.set(false);

      component.closeMenu();

      expect(component.isMenuOpen()).toBe(false);
    });
  });
});
