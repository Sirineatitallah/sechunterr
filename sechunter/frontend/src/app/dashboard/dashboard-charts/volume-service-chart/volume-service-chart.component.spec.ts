import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeServiceChartComponent } from './volume-service-chart.component';

describe('VolumeServiceChartComponent', () => {
  let component: VolumeServiceChartComponent;
  let fixture: ComponentFixture<VolumeServiceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeServiceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeServiceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
