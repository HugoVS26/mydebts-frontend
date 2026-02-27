import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { NotFoundPage } from './not-found';

describe('Given a NotFoundPage component', () => {
  let component: NotFoundPage;
  let fixture: ComponentFixture<NotFoundPage>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '', component: NotFoundPage }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('When the component is initialized', () => {
    it('Should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('When onGoHome is called', () => {
    it('Should navigate to /', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onGoHome();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
