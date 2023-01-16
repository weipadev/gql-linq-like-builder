import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GqlLinqLikeBuilderComponent } from './gql-linq-like-builder.component';

describe('GqlLinqLikeBuilderComponent', () => {
  let component: GqlLinqLikeBuilderComponent;
  let fixture: ComponentFixture<GqlLinqLikeBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GqlLinqLikeBuilderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GqlLinqLikeBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
