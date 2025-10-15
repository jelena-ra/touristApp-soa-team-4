import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoughtTours } from './bought-tours';

describe('BoughtTours', () => {
  let component: BoughtTours;
  let fixture: ComponentFixture<BoughtTours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoughtTours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoughtTours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
