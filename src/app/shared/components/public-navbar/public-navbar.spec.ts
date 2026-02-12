import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { PublicNavbar } from './public-navbar';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('PublicNavbar', () => {
  let component: PublicNavbar;
  let fixture: ComponentFixture<PublicNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicNavbar],
      providers: [provideRouter([]), provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });

    it('Then it should read theme mode', () => {
      expect(component.isLightMode()).toBeDefined();
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
