import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-draggable-container',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './draggable-container.component.html',
  styleUrls: ['./draggable-container.component.scss']
})
export class DraggableContainerComponent implements OnInit, AfterViewInit {
  @Input() id: string = '';
  @Input() title: string = 'Draggable Container';
  @Input() initialX: number = 0;
  @Input() initialY: number = 0;
  @Input() initialWidth: number = 400;
  @Input() initialHeight: number = 300;
  @Input() minWidth: number = 200;
  @Input() minHeight: number = 150;
  @Input() resizable: boolean = true;
  @Input() draggable: boolean = true;
  @Input() collapsible: boolean = true;
  @Input() closable: boolean = true;
  @Input() zIndex: number = 1;
  
  @Output() closed = new EventEmitter<string>();
  @Output() positionChanged = new EventEmitter<{id: string, x: number, y: number}>();
  @Output() sizeChanged = new EventEmitter<{id: string, width: number, height: number}>();
  
  @ViewChild('container') containerRef!: ElementRef;
  
  isCollapsed: boolean = false;
  isDragging: boolean = false;
  isResizing: boolean = false;
  startX: number = 0;
  startY: number = 0;
  startWidth: number = 0;
  startHeight: number = 0;
  currentX: number = 0;
  currentY: number = 0;
  currentWidth: number = 0;
  currentHeight: number = 0;
  
  constructor() { }

  ngOnInit(): void {
    this.currentX = this.initialX;
    this.currentY = this.initialY;
    this.currentWidth = this.initialWidth;
    this.currentHeight = this.initialHeight;
  }
  
  ngAfterViewInit(): void {
    if (this.containerRef && this.containerRef.nativeElement) {
      const container = this.containerRef.nativeElement;
      container.style.left = `${this.currentX}px`;
      container.style.top = `${this.currentY}px`;
      container.style.width = `${this.currentWidth}px`;
      container.style.height = `${this.currentHeight}px`;
      container.style.zIndex = this.zIndex.toString();
    }
  }
  
  onDragStart(event: MouseEvent): void {
    if (!this.draggable) return;
    
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    
    // Bring to front when dragging
    this.bringToFront();
    
    // Prevent text selection during drag
    event.preventDefault();
    
    // Add global event listeners
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }
  
  onDragMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    
    this.currentX += deltaX;
    this.currentY += deltaY;
    
    if (this.containerRef && this.containerRef.nativeElement) {
      this.containerRef.nativeElement.style.left = `${this.currentX}px`;
      this.containerRef.nativeElement.style.top = `${this.currentY}px`;
    }
    
    this.startX = event.clientX;
    this.startY = event.clientY;
  }
  
  onDragEnd = (): void => {
    this.isDragging = false;
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    
    // Emit position change event
    this.positionChanged.emit({
      id: this.id,
      x: this.currentX,
      y: this.currentY
    });
  }
  
  onResizeStart(event: MouseEvent): void {
    if (!this.resizable) return;
    
    this.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.currentWidth;
    this.startHeight = this.currentHeight;
    
    // Bring to front when resizing
    this.bringToFront();
    
    // Prevent text selection during resize
    event.preventDefault();
    
    // Add global event listeners
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }
  
  onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;
    
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    
    this.currentWidth = Math.max(this.startWidth + deltaX, this.minWidth);
    this.currentHeight = Math.max(this.startHeight + deltaY, this.minHeight);
    
    if (this.containerRef && this.containerRef.nativeElement) {
      this.containerRef.nativeElement.style.width = `${this.currentWidth}px`;
      this.containerRef.nativeElement.style.height = `${this.currentHeight}px`;
    }
  }
  
  onResizeEnd = (): void => {
    this.isResizing = false;
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    
    // Emit size change event
    this.sizeChanged.emit({
      id: this.id,
      width: this.currentWidth,
      height: this.currentHeight
    });
  }
  
  toggleCollapse(): void {
    if (!this.collapsible) return;
    
    this.isCollapsed = !this.isCollapsed;
    
    if (this.containerRef && this.containerRef.nativeElement) {
      if (this.isCollapsed) {
        this.containerRef.nativeElement.classList.add('collapsed');
      } else {
        this.containerRef.nativeElement.classList.remove('collapsed');
      }
    }
  }
  
  close(): void {
    if (!this.closable) return;
    
    this.closed.emit(this.id);
  }
  
  bringToFront(): void {
    // Increase z-index to bring to front
    this.zIndex += 1;
    
    if (this.containerRef && this.containerRef.nativeElement) {
      this.containerRef.nativeElement.style.zIndex = this.zIndex.toString();
    }
  }
}
