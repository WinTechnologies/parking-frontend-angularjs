import { TestBed, inject } from '@angular/core/testing';

import { ActEnforcementPredictionService } from './act-enforcement-prediction.service';

describe('ActEnforcementPredictionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActEnforcementPredictionService]
    });
  });

  it('should be created', inject([ActEnforcementPredictionService], (service: ActEnforcementPredictionService) => {
    expect(service).toBeTruthy();
  }));
});
