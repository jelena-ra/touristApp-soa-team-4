import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyPointDialog } from './key-point-dialog';

describe('KeyPointDialog', () => {
  let component: KeyPointDialog;
  let fixture: ComponentFixture<KeyPointDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyPointDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyPointDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
