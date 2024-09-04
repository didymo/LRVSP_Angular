import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDataSelectorComponent } from './tree-data-selector.component';

describe('GraphDataSelectorComponent', () => {
  let component: TreeDataSelectorComponent;
  let fixture: ComponentFixture<TreeDataSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDataSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDataSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
