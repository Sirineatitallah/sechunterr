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
  styleUrls: ['./dashboard-grid.component.scss']
})
export class DashboardGridComponent {
  @Input() widgets: WidgetPosition[] = [];

  constructor(private store: Store) {}

  onDrop(event: CdkDragDrop<WidgetPosition[]>) {
    // Using moveItemInArray instead of moveItemInGrid which doesn't exist
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
    this.store.dispatch(new UpdateLayout(this.widgets));
  }

  getGridArea(widget: WidgetPosition): string {
    return `${widget.y} / ${widget.x} / ${widget.y + widget.rows} / ${widget.x + widget.cols}`;
  }
}