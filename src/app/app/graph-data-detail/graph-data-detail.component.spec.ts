import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDataDetailComponent } from './graph-data-detail.component';

describe('GraphDataDetailComponent', () => {
  let component: GraphDataDetailComponent;
  let fixture: ComponentFixture<GraphDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphDataDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
