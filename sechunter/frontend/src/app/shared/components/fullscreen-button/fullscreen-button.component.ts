import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullscreenService } from '../../../core/services/fullscreen.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fullscreen-button',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <button 
      class="fullscreen-button" 
      mat-icon-button 
      [matTooltip]="isFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran'"
      (click)="toggleFullscreen()">
      <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
    </button>
  `,
  styles: [`
    .fullscreen-button {
      color: #00f3ff;
      background: rgba(10, 14, 31, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 243, 255, 0.2);
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .fullscreen-button:hover {
      background: rgba(10, 14, 31, 0.8);
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
      transform: scale(1.05);
    }
  `]
})
export class FullscreenButtonComponent implements OnInit, OnDestroy {
  isFullscreen = false;
  private subscription: Subscription | null = null;

  constructor(private fullscreenService: FullscreenService) { }

  ngOnInit(): void {
    this.subscription = this.fullscreenService.getFullscreenState()
      .subscribe(state => {
        this.isFullscreen = state;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleFullscreen(): void {
    this.fullscreenService.toggleFullscreen();
  }
}
