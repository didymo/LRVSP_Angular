import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDataSelectorComponent } from './graph-data-selector.component';

describe('GraphDataSelectorComponent', () => {
  let component: GraphDataSelectorComponent;
  let fixture: ComponentFixture<GraphDataSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphDataSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphDataSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
