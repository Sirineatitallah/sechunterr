import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-history.component.html',
  // Removed styleUrls to fix missing stylesheet error
  // styleUrls: ['./action-history.component.scss']
})
export class ActionHistoryComponent implements OnInit {
  actionHistory: { id: string; description: string; timestamp: Date }[] = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: Fetch real data from service
    this.actionHistory = [
      { id: 'a1', description: 'Scan ASM terminé à 14h30', timestamp: new Date(Date.now() - 3600 * 1000) },
      { id: 'a2', description: 'Nouveau scan CTI lancé', timestamp: new Date(Date.now() - 7200 * 1000) }
    ];
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
