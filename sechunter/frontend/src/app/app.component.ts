import { Component, Inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformServer, CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SimpleChatbotComponent } from './simple-chatbot/simple-chatbot.component';
// These components are loaded via routing, not directly in the template

const STATE_KEY = makeStateKey<string>('exampleState');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    SimpleChatbotComponent
  ],
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
    }
  }
}

import { AuthService } from './core/services/auth.service';
