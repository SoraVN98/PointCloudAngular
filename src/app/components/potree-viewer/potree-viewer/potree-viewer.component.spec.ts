import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PotreeViewerComponent } from './potree-viewer.component';

describe('PotreeViewerComponent', () => {
  let component: PotreeViewerComponent;
  let fixture: ComponentFixture<PotreeViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PotreeViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PotreeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
