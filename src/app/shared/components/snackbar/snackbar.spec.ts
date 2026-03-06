import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { Snackbar } from './snackbar';

describe('Given a Snackbar component', () => {
  let component: Snackbar;
  let fixture: ComponentFixture<Snackbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatSnackBarRef, useValue: { dismiss: vi.fn() } },
        { provide: MAT_SNACK_BAR_DATA, useValue: { message: 'Test message', type: 'success' } },
      ],
      imports: [Snackbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Snackbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });
});
