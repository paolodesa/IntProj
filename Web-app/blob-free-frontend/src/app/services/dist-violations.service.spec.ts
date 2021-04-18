import { TestBed } from '@angular/core/testing';

import { DistViolationsService } from './dist-violations.service';

describe('DistViolationsService', () => {
  let service: DistViolationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistViolationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
