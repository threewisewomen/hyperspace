import { TestBed } from '@angular/core/testing';

import { EegApiService } from './eeg-api.service';

describe('EegApiService', () => {
  let service: EegApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EegApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
