import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorites-quick-widgets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites-quick-widgets.component.html',
  styleUrls: ['./favorites-quick-widgets.component.scss']
})
export class FavoritesQuickWidgetsComponent {
  quickWidgets = [
    { id: 1, name: 'Widget 1', icon: '⭐' },
    { id: 2, name: 'Widget 2', icon: '🔥' },
    { id: 3, name: 'Widget 3', icon: '⚡' }
  ];

  onWidgetClick(widget: any) {
    console.log('Quick widget clicked:', widget);
    // Implement widget action here
  }
}
