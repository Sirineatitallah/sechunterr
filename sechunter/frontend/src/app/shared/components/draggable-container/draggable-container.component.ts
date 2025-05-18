import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-draggable-container',
  standalone: true,
  imports: [],
  templateUrl: './draggable-container.component.html',
  styleUrl: './draggable-container.component.scss'
})
export class DraggableContainerComponent {
  @Input() connectedLists: string[] = [];
  @Input() widgets: any[] = [];
  @Output() layoutChanged = new EventEmitter<any[]>();

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.layoutChanged.emit(this.widgets);
  }
}