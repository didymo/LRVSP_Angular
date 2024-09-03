import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDataDisplayComponent } from './tree-data-display.component';

describe('GraphDataDisplayComponent', () => {
  let component: TreeDataDisplayComponent;
  let fixture: ComponentFixture<TreeDataDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDataDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDataDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
