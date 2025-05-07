import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

// Mock AuthService
class MockAuthService {
  private authStateSubject = new BehaviorSubject<boolean>(true);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  isAuthenticated(): boolean {
    return true;
  }

  login(username: string, password: string): boolean {
    return true;
  }

  logout(): void {}

  getUserRole(): string {
    return 'admin';
  }
}

// Mock ThemeService
class MockThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();

  setTheme(theme: string): void {
    this.themeSubject.next(theme);
  }
}

describe('Component Tests', () => {
  // Test AppComponent
  describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          CommonModule,
          HttpClientTestingModule,
          AppComponent
        ],
        providers: [
          { provide: AuthService, useClass: MockAuthService },
          { provide: ThemeService, useClass: MockThemeService }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have title as "sechunter"', () => {
      expect(component.title).toEqual('sechunter');
    });
  });

  // Test HeaderComponent
  describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          FormsModule,
          RouterTestingModule,
          HttpClientTestingModule,
          HeaderComponent
        ],
        providers: [
          { provide: ThemeService, useClass: MockThemeService }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have instances', () => {
      expect(component.instances.length).toBeGreaterThan(0);
    });
  });

  // Test SidebarComponent
  describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          RouterTestingModule,
          HttpClientTestingModule,
          SidebarComponent
        ],
        providers: [
          { provide: ThemeService, useClass: MockThemeService }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have menu items', () => {
      expect(component.menuItems.length).toBeGreaterThan(0);
    });
  });

  // Test MainDashboardComponent
  describe('MainDashboardComponent', () => {
    let component: MainDashboardComponent;
    let fixture: ComponentFixture<MainDashboardComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CommonModule,
          FormsModule,
          RouterTestingModule,
          HttpClientTestingModule,
          MainDashboardComponent
        ],
        providers: [
          { provide: ThemeService, useClass: MockThemeService }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(MainDashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have dashboard widgets', () => {
      expect(component.dashboardWidgets.length).toBeGreaterThan(0);
    });

    it('should have gallery widgets', () => {
      expect(component.galleryWidgets.length).toBeGreaterThan(0);
    });
  });
});
