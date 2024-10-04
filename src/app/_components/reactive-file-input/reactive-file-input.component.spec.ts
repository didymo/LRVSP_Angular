import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFileInputComponent } from './reactive-file-input.component';

describe('ReactiveFileInputComponent', () => {
  let component: ReactiveFileInputComponent;
  let fixture: ComponentFixture<ReactiveFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFileInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
