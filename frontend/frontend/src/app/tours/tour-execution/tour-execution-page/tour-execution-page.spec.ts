import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourExecutionPageComponent } from './tour-execution-page'; 

describe('TourExecutionPageComponent', () => { 

  let component: TourExecutionPageComponent;
  let fixture: ComponentFixture<TourExecutionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [TourExecutionPageComponent]
    })
    .compileComponents();

  
    fixture = TestBed.createComponent(TourExecutionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});