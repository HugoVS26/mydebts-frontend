import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { App } from './app';
import { AuthService } from './features/auth/services/auth';

describe('Given an App component', () => {
  let authServiceMock: {
    loadUserFromToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      loadUserFromToken: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  describe('When the component is initialized', () => {
    it('Should create the app', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance).toBeTruthy();
    });

    it('Should have title signal with value MyDebts', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance['title']()).toBe('MyDebts');
    });

    it('Should call loadUserFromToken on initialization', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(authServiceMock.loadUserFromToken).toHaveBeenCalledOnce();
    });
  });
});
