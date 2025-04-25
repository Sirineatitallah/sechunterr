import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViComponent } from './vi.component';

describe('ViComponent', () => {
  let component: ViComponent;
  let fixture: ComponentFixture<ViComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
