import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityEventsComponent } from './security-events.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SecurityEventsComponent', () => {
  let component: SecurityEventsComponent;
  let fixture: ComponentFixture<SecurityEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SecurityEventsComponent,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatTooltipModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SecurityEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with mock events', () => {
    expect(component.securityEvents.length).toBeGreaterThan(0);
    expect(component.filteredEvents.length).toBeGreaterThan(0);
  });

  it('should filter events by status', () => {
    // Test 'all' filter
    component.filterEvents('all');
    expect(component.activeFilter).toBe('all');
    expect(component.filteredEvents.length).toBe(component.securityEvents.length);

    // Test 'upcoming' filter
    component.filterEvents('upcoming');
    expect(component.activeFilter).toBe('upcoming');
    expect(component.filteredEvents.every(event => event.status === 'upcoming')).toBeTrue();

    // Test 'in-progress' filter
    component.filterEvents('in-progress');
    expect(component.activeFilter).toBe('in-progress');
    expect(component.filteredEvents.every(event => event.status === 'in-progress')).toBeTrue();
  });

  it('should return correct icon for event type', () => {
    expect(component.getEventIcon('maintenance')).toBe('build');
    expect(component.getEventIcon('update')).toBe('system_update');
    expect(component.getEventIcon('exercise')).toBe('fitness_center');
    expect(component.getEventIcon('incident')).toBe('warning');
    expect(component.getEventIcon('unknown')).toBe('event');
  });

  it('should return correct color for event priority', () => {
    expect(component.getPriorityColor('critical')).toBe('#ff4757');
    expect(component.getPriorityColor('high')).toBe('#ffa502');
    expect(component.getPriorityColor('medium')).toBe('#1e90ff');
    expect(component.getPriorityColor('low')).toBe('#2ed573');
    expect(component.getPriorityColor('unknown')).toBe('#1e90ff');
  });

  it('should format date correctly', () => {
    const testDate = new Date('2023-05-15T14:30:00');
    const formattedDate = component.formatDate(testDate);
    
    // The exact format will depend on the locale, but we can check for some expected parts
    expect(formattedDate).toContain('14:30');
    expect(formattedDate).toContain('2023');
  });
});
