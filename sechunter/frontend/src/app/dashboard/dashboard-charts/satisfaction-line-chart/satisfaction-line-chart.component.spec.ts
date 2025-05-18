import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfactionLineChartComponent } from './satisfaction-line-chart.component';

describe('SatisfactionLineChartComponent', () => {
  let component: SatisfactionLineChartComponent;
  let fixture: ComponentFixture<SatisfactionLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SatisfactionLineChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SatisfactionLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
