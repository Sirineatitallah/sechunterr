import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraggableContainerComponent } from './draggable-container.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface WidgetConfig {
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
  selector: 'app-draggable-demo',
  standalone: true,
  imports: [CommonModule, DraggableContainerComponent, MatButtonModule, MatIconModule],
  template: `
    <div class="demo-container">
      <div class="controls">
        <button mat-raised-button color="primary" (click)="addWidget()">
          <mat-icon>add</mat-icon> Add Widget
        </button>
      </div>
      
      <div class="workspace">
        <app-draggable-container
          *ngFor="let widget of widgets"
          [id]="widget.id"
          [title]="widget.title"
          [initialX]="widget.x"
          [initialY]="widget.y"
          [initialWidth]="widget.width"
          [initialHeight]="widget.height"
          [style.display]="widget.visible ? 'block' : 'none'"
          (closed)="onWidgetClosed($event)"
          (positionChanged)="onPositionChanged($event)"
          (sizeChanged)="onSizeChanged($event)">
          
          <div [innerHTML]="widget.content"></div>
          
        </app-draggable-container>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .controls {
      padding: 16px;
      background-color: rgba(16, 23, 41, 0.8);
      border-bottom: 1px solid rgba(100, 217, 255, 0.3);
      display: flex;
      gap: 16px;
    }
    
    .workspace {
      position: relative;
      flex: 1;
      background-color: rgba(10, 14, 25, 0.9);
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(30, 60, 114, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(20, 120, 120, 0.1) 0%, transparent 50%);
      overflow: hidden;
      min-height: 500px;
    }
  `]
})
export class DraggableDemoComponent {
  widgets: WidgetConfig[] = [
    {
      id: 'widget1',
      title: 'Security Overview',
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      content: `
        <div style="padding: 16px;">
          <h3 style="color: #64d9ff; margin-bottom: 16px;">Security Status</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ff4d6a;">12</div>
              <div style="color: #a0a8c0;">Critical Alerts</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ffaa00;">28</div>
              <div style="color: #a0a8c0;">Warnings</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #00c853;">85%</div>
              <div style="color: #a0a8c0;">Security Score</div>
            </div>
          </div>
          <p style="color: #e1e1e6; line-height: 1.5;">
            Your system security status requires attention. 
            Please review the critical alerts and take necessary actions.
          </p>
        </div>
      `,
      visible: true
    },
    {
      id: 'widget2',
      title: 'Recent Activities',
      x: 500,
      y: 50,
      width: 450,
      height: 350,
      content: `
        <div style="padding: 16px;">
          <h3 style="color: #64d9ff; margin-bottom: 16px;">Activity Log</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #e1e1e6;">System scan completed</span>
                <span style="color: #a0a8c0;">10:45 AM</span>
              </div>
            </li>
            <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #e1e1e6;">New vulnerability detected</span>
                <span style="color: #a0a8c0;">09:32 AM</span>
              </div>
            </li>
            <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #e1e1e6;">Firewall rules updated</span>
                <span style="color: #a0a8c0;">Yesterday</span>
              </div>
            </li>
            <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #e1e1e6;">User login attempt failed</span>
                <span style="color: #a0a8c0;">Yesterday</span>
              </div>
            </li>
          </ul>
        </div>
      `,
      visible: true
    }
  ];
  
  widgetCounter = this.widgets.length;
  
  addWidget(): void {
    this.widgetCounter++;
    
    const newWidget: WidgetConfig = {
      id: `widget${this.widgetCounter}`,
      title: `Widget ${this.widgetCounter}`,
      x: 100 + (this.widgetCounter % 3) * 50,
      y: 100 + (this.widgetCounter % 3) * 50,
      width: 400,
      height: 300,
      content: `
        <div style="padding: 16px;">
          <h3 style="color: #64d9ff; margin-bottom: 16px;">New Widget ${this.widgetCounter}</h3>
          <p style="color: #e1e1e6; line-height: 1.5;">
            This is a new draggable widget. You can move it, resize it, collapse it, or close it.
          </p>
        </div>
      `,
      visible: true
    };
    
    this.widgets.push(newWidget);
  }
  
  onWidgetClosed(widgetId: string): void {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.visible = false;
    }
  }
  
  onPositionChanged(event: {id: string, x: number, y: number}): void {
    const widget = this.widgets.find(w => w.id === event.id);
    if (widget) {
      widget.x = event.x;
      widget.y = event.y;
    }
  }
  
  onSizeChanged(event: {id: string, width: number, height: number}): void {
    const widget = this.widgets.find(w => w.id === event.id);
    if (widget) {
      widget.width = event.width;
      widget.height = event.height;
    }
  }
}
