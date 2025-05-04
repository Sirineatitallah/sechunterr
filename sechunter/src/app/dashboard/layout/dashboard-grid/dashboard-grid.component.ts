import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngxs/store';
import { UpdateLayout } from './../../../core/data/stores/dashboard.actions';
import { WidgetPosition } from './../../../core/models/widget-position.model';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WidgetComponent } from './../../../shared/components/widget/widget.component';

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule, WidgetComponent],
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.scss'],
  host: {
    class: 'grid-container',
    '[style.grid-template-columns]': "'repeat(auto-fill, minmax(300px, 1fr))'"
  }
})
export class DashboardGridComponent {
handleWidgetAction($event: { action: string; }) {
throw new Error('Method not implemented.');
}
  @Input() widgets: WidgetPosition[] = [];

  constructor(private store: Store) {}

  onDrop(event: CdkDragDrop<WidgetPosition[]>) {
    const updatedWidgets = [...this.widgets];
    moveItemInArray(updatedWidgets, event.previousIndex, event.currentIndex);
    this.store.dispatch(new UpdateLayout(updatedWidgets));
  }

  trackByWidgetId(index: number, widget: WidgetPosition): string {
    return widget.id;
  }
}