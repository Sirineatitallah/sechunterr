import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoarComponent } from './soar.component';

describe('SoarComponent', () => {
  let component: SoarComponent;
  let fixture: ComponentFixture<SoarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
