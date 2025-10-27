import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyPointsMapPageComponent } from './key-points-map-page';

describe('KeyPointsMapPage', () => {
  let component: KeyPointsMapPageComponent;
  let fixture: ComponentFixture<KeyPointsMapPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyPointsMapPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyPointsMapPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
