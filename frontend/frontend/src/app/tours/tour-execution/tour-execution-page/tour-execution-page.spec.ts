import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourExecutionPageComponent } from './tour-execution-page'; // Ispravi putanju ako treba

describe('TourExecutionPageComponent', () => { // Ispravka i ovde
  // ISPRAVKA #2: Ispravi tipove
  let component: TourExecutionPageComponent;
  let fixture: ComponentFixture<TourExecutionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // ISPRAVKA #3: Ispravi ime komponente
      imports: [TourExecutionPageComponent]
    })
    .compileComponents();

    // ISPRAVKA #4: I ovde
    fixture = TestBed.createComponent(TourExecutionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});