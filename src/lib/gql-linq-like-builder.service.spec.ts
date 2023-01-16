import { TestBed } from '@angular/core/testing';

import { GqlLinqLikeBuilderService } from './gql-linq-like-builder.service';

describe('GqlLinqLikeBuilderService', () => {
  let service: GqlLinqLikeBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GqlLinqLikeBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
