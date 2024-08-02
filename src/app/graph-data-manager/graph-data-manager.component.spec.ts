import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDataManagerComponent } from './graph-data-manager.component';

describe('GraphDataManagerComponent', () => {
  let component: GraphDataManagerComponent;
  let fixture: ComponentFixture<GraphDataManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphDataManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphDataManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
