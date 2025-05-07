import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './core/layout/header/header.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sechunter';
  showLayout = false;
  darkMode = false;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.darkMode = theme === 'dark';
    });

    // Subscribe to auth state changes
    this.authService.authState$.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/auth']);
      }
    });

    // Hide header and sidebar on auth and signup routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const authRoutes = ['/auth', '/signup'];
      const isAuthRoute = authRoutes.some(route => event.urlAfterRedirects.startsWith(route));
      this.showLayout = !isAuthRoute && this.authService.isAuthenticated();
    });
  }
}
