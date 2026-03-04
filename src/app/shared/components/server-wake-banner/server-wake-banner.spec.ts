import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ServerWakeBanner } from './server-wake-banner';

describe('Given a ServerWakeBanner component', () => {
  let component: ServerWakeBanner;
  let fixture: ComponentFixture<ServerWakeBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ServerWakeBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerWakeBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });
});
