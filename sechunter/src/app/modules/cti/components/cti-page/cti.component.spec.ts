import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtiComponent } from './cti.component';

describe('CtiComponent', () => {
  let component: CtiComponent;
  let fixture: ComponentFixture<CtiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
