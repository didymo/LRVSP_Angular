import { TestBed } from '@angular/core/testing';

import { RequestSchedulerService } from './request-scheduler.service';

describe('RequestSchedulerService', () => {
  let service: RequestSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
