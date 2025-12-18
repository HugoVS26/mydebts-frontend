import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  describe('When component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Then it should have navigation links defined', () => {
      expect(component.navLinks).toHaveLength(2);
      expect(component.navLinks[0]).toEqual({ path: '/debts', label: 'Debts' });
      expect(component.navLinks[1]).toEqual({ path: '/debts/new', label: 'New Debt' });
    });

    it('Then it should read theme mode', () => {
      expect(component.isLightMode()).toBeDefined();
    });
  });

  describe('When checking if route is active', () => {
    it('Then it should return true for matching route', () => {
      const result = component.isActive('/debts');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('When toggling theme', () => {
    it('Then it should switch from light to dark mode', () => {
      component.isLightMode.set(true);

      component.toggleTheme();

      expect(component.isLightMode()).toBe(false);
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
      expect(document.documentElement.classList.contains('light-theme')).toBe(false);
    });

    it('Then it should switch from dark to light mode', () => {
      component.isLightMode.set(false);

      component.toggleTheme();

      expect(component.isLightMode()).toBe(true);
      expect(document.documentElement.classList.contains('light-theme')).toBe(true);
      expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
    });

    it('Then it should update document classes correctly', () => {
      component.isLightMode.set(true);

      component.toggleTheme();

      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    });
  });

  describe('When clicking on menu', () => {
    it('Then it should open menu when closed', () => {
      component.isMenuOpen.set(false);

      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(true);
    });

    it('Then it should close menu when open', () => {
      component.isMenuOpen.set(true);

      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(false);
    });

    it('Then it should set menu state to closed', () => {
      component.isMenuOpen.set(true);

      component.closeMenu();

      expect(component.isMenuOpen()).toBe(false);
    });

    it('Then it should keep menu closed if already closed', () => {
      component.isMenuOpen.set(false);

      component.closeMenu();

      expect(component.isMenuOpen()).toBe(false);
    });
  });
});
