import { TestBed } from '@angular/core/testing';

import { Following } from './following';

describe('Following', () => {
  let service: Following;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Following);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
