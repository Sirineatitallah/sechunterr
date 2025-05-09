# Draggable Container Component Usage

The `DraggableContainerComponent` provides a draggable, resizable, collapsible, and closable container that can be used to create dynamic UI elements like widgets, panels, or modals.

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { DraggableContainerComponent } from 'src/app/shared/components/draggable-container/draggable-container.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [DraggableContainerComponent],
  template: `
    <div class="workspace">
      <app-draggable-container
        id="widget1"
        title="My Widget"
        [initialX]="100"
        [initialY]="100"
        [initialWidth]="400"
        [initialHeight]="300"
        (closed)="onWidgetClosed($event)"
        (positionChanged)="onPositionChanged($event)"
        (sizeChanged)="onSizeChanged($event)">
        
        <!-- Your content goes here -->
        <div class="widget-content">
          <h3>Widget Content</h3>
          <p>This is the content of the draggable widget.</p>
        </div>
        
      </app-draggable-container>
    </div>
  `,
  styles: [`
    .workspace {
      position: relative;
      width: 100%;
      height: 100vh;
      background-color: #f0f0f0;
    }
    
    .widget-content {
      padding: 10px;
    }
  `]
})
export class ExampleComponent {
  onWidgetClosed(widgetId: string): void {
    console.log(`Widget ${widgetId} closed`);
  }
  
  onPositionChanged(event: {id: string, x: number, y: number}): void {
    console.log(`Widget ${event.id} moved to position: x=${event.x}, y=${event.y}`);
  }
  
  onSizeChanged(event: {id: string, width: number, height: number}): void {
    console.log(`Widget ${event.id} resized to: width=${event.width}, height=${event.height}`);
  }
}
```

## Available Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| id | string | '' | Unique identifier for the container |
| title | string | 'Draggable Container' | Title displayed in the header |
| initialX | number | 0 | Initial X position in pixels |
| initialY | number | 0 | Initial Y position in pixels |
| initialWidth | number | 400 | Initial width in pixels |
| initialHeight | number | 300 | Initial height in pixels |
| minWidth | number | 200 | Minimum width in pixels |
| minHeight | number | 150 | Minimum height in pixels |
| resizable | boolean | true | Whether the container can be resized |
| draggable | boolean | true | Whether the container can be dragged |
| collapsible | boolean | true | Whether the container can be collapsed |
| closable | boolean | true | Whether the container can be closed |
| zIndex | number | 1 | Initial z-index value |

## Available Outputs

| Output | Type | Description |
|--------|------|-------------|
| closed | EventEmitter<string> | Emitted when the container is closed, with the container ID |
| positionChanged | EventEmitter<{id: string, x: number, y: number}> | Emitted when the container position changes |
| sizeChanged | EventEmitter<{id: string, width: number, height: number}> | Emitted when the container size changes |

## Managing Multiple Containers

To manage multiple draggable containers, you can use an array of container configurations:

```typescript
interface ContainerConfig {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  visible: boolean;
}

@Component({
  // ...
  template: `
    <div class="workspace">
      <app-draggable-container
        *ngFor="let container of containers"
        [id]="container.id"
        [title]="container.title"
        [initialX]="container.x"
        [initialY]="container.y"
        [initialWidth]="container.width"
        [initialHeight]="container.height"
        (closed)="onContainerClosed($event)"
        [style.display]="container.visible ? 'block' : 'none'">
        
        <div [innerHTML]="container.content"></div>
        
      </app-draggable-container>
    </div>
  `
})
export class MultipleContainersComponent {
  containers: ContainerConfig[] = [
    {
      id: 'container1',
      title: 'Container 1',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      content: '<h3>Container 1 Content</h3><p>This is the first container.</p>',
      visible: true
    },
    {
      id: 'container2',
      title: 'Container 2',
      x: 550,
      y: 100,
      width: 400,
      height: 300,
      content: '<h3>Container 2 Content</h3><p>This is the second container.</p>',
      visible: true
    }
  ];
  
  onContainerClosed(containerId: string): void {
    const container = this.containers.find(c => c.id === containerId);
    if (container) {
      container.visible = false;
    }
  }
}
```
