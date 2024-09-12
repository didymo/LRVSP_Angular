import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDataDisplayComponent } from './graph-data-display.component';

describe('GraphDataDisplayComponent', () => {
  let component: GraphDataDisplayComponent;
  let fixture: ComponentFixture<GraphDataDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphDataDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphDataDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
