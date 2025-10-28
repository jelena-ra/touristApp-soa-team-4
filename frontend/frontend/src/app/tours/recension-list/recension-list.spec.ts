import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecensionList } from './recension-list';

describe('RecensionList', () => {
  let component: RecensionList;
  let fixture: ComponentFixture<RecensionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecensionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecensionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
