import { TestBed } from '@angular/core/testing';

import { ThreatFeedService } from './threat-feed.service';

describe('ThreatFeedService', () => {
  let service: ThreatFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreatFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
