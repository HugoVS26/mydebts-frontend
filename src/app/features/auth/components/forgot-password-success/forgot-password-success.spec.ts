import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ForgotPasswordSuccess } from './forgot-password-success';

describe('Given a ForgotPasswordSuccess component', () => {
  let component: ForgotPasswordSuccess;
  let fixture: ComponentFixture<ForgotPasswordSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordSuccess],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('When the navigate to login button is clicked', () => {
    it('Should emit navigateToLogin', () => {
      let emitted = false;
      component.navigateToLogin.subscribe(() => (emitted = true));

      component.onNavigateToLogin();

      expect(emitted).toBeTruthy();
    });
  });
});
