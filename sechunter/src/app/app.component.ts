import { Component, Inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformServer, CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { filter } from 'rxjs/operators';

const STATE_KEY = makeStateKey<string>('exampleState');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sechunter';
  showLayout = true;

  constructor(
    public authService: AuthService,
    @Inject(TransferState) private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(STATE_KEY, 'This is server state');
    } else {
      const state = this.transferState.get(STATE_KEY, 'No state');
      console.log('Hydrated state:', state);

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        // Hide header and sidebar on auth and signup routes
        this.showLayout = !(event.urlAfterRedirects.startsWith('/auth') || event.urlAfterRedirects.startsWith('/signup'));
      });
    }
  }
}

import { AuthService } from './core/services/auth.service';
