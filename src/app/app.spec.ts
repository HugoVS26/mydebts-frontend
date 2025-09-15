import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Given an App component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection()], // still needed for standalone components
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
