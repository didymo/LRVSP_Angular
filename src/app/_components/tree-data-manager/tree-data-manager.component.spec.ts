import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDataManagerComponent } from './tree-data-manager.component';

describe('GraphDataManagerComponent', () => {
  let component: TreeDataManagerComponent;
  let fixture: ComponentFixture<TreeDataManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDataManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDataManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
