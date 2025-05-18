import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetRealityChartComponent } from './target-reality-chart.component';

describe('TargetRealityChartComponent', () => {
  let component: TargetRealityChartComponent;
  let fixture: ComponentFixture<TargetRealityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetRealityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetRealityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
