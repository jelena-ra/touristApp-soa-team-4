import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecensionForm } from './recension-form';

describe('RecensionForm', () => {
  let component: RecensionForm;
  let fixture: ComponentFixture<RecensionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecensionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecensionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
