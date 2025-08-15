import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profileform } from './profileform';

describe('Profileform', () => {
  let component: Profileform;
  let fixture: ComponentFixture<Profileform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profileform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profileform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
