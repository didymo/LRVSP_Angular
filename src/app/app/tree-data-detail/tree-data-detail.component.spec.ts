import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDataDetailComponent } from './tree-data-detail.component';

describe('GraphDataDetailComponent', () => {
  let component: TreeDataDetailComponent;
  let fixture: ComponentFixture<TreeDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDataDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
