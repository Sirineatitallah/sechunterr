import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardStateService, DashboardLayout } from '../../services/dashboard-state.service';

@Component({
  selector: 'app-layout-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="layout-manager">
      <div class="layout-manager-header">
        <h3>Gestion des Layouts</h3>
        <button class="close-button" (click)="close()">
          <i class="material-icons">close</i>
        </button>
      </div>
      
      <div class="layout-manager-content">
        <div class="layout-list">
          <div class="layout-list-header">
            <h4>Layouts Disponibles</h4>
            <button class="add-button" (click)="showNewLayoutForm()">
              <i class="material-icons">add</i>
              Nouveau
            </button>
          </div>
          
          <div class="layouts">
            <div 
              *ngFor="let layout of layouts" 
              class="layout-item"
              [class.active]="layout.id === currentLayoutId"
              (click)="selectLayout(layout.id)"
            >
              <div class="layout-info">
                <div class="layout-name">{{ layout.name }}</div>
                <div class="layout-meta">
                  <span class="widget-count">{{ layout.widgets.length }} widgets</span>
                  <span class="layout-date">{{ layout.updatedAt | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              
              <div class="layout-actions">
                <button 
                  class="layout-action-button" 
                  [disabled]="layout.isDefault"
                  (click)="setAsDefault(layout.id, $event)"
                  [title]="layout.isDefault ? 'Layout par défaut' : 'Définir comme défaut'"
                >
                  <i class="material-icons">{{ layout.isDefault ? 'star' : 'star_outline' }}</i>
                </button>
                <button 
                  class="layout-action-button" 
                  (click)="duplicateLayout(layout.id, $event)"
                  title="Dupliquer"
                >
                  <i class="material-icons">content_copy</i>
                </button>
                <button 
                  class="layout-action-button" 
                  [disabled]="layout.isDefault"
                  (click)="deleteLayout(layout.id, $event)"
                  title="Supprimer"
                >
                  <i class="material-icons">delete</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="layout-form" *ngIf="showForm">
          <h4>{{ editingLayout ? 'Modifier Layout' : 'Nouveau Layout' }}</h4>
          
          <div class="form-group">
            <label for="layoutName">Nom</label>
            <input 
              type="text" 
              id="layoutName" 
              [(ngModel)]="newLayoutName" 
              placeholder="Nom du layout"
              class="form-control"
            >
          </div>
          
          <div class="form-actions">
            <button class="cancel-button" (click)="cancelForm()">Annuler</button>
            <button 
              class="save-button" 
              [disabled]="!newLayoutName.trim()" 
              (click)="saveLayout()"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
      
      <div class="layout-manager-footer">
        <button class="secondary-button" (click)="resetToDefault()">Réinitialiser</button>
        <button class="primary-button" (click)="applyChanges()">Appliquer</button>
      </div>
    </div>
  `,
  styles: [`
    .layout-manager {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 600px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .layout-manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }
    
    .layout-manager-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .close-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }
    
    .close-button i {
      font-size: 20px;
    }
    
    .layout-manager-content {
      padding: 20px;
      display: flex;
      gap: 20px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .layout-list {
      flex: 1;
    }
    
    .layout-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .layout-list-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .add-button {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .add-button:hover {
      background-color: #e0e0e0;
    }
    
    .add-button i {
      font-size: 16px;
    }
    
    .layouts {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .layout-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid #eee;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .layout-item:hover {
      border-color: #ddd;
      background-color: #f9f9f9;
    }
    
    .layout-item.active {
      border-color: #3f51b5;
      background-color: rgba(63, 81, 181, 0.05);
    }
    
    .layout-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .layout-name {
      font-weight: 500;
      font-size: 14px;
    }
    
    .layout-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;
    }
    
    .layout-actions {
      display: flex;
      gap: 4px;
    }
    
    .layout-action-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .layout-action-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }
    
    .layout-action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .layout-action-button i {
      font-size: 16px;
    }
    
    .layout-form {
      flex: 1;
      border-left: 1px solid #eee;
      padding-left: 20px;
    }
    
    .layout-form h4 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-control:focus {
      border-color: #3f51b5;
      outline: none;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cancel-button, .save-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .cancel-button {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      color: #333;
    }
    
    .cancel-button:hover {
      background-color: #e0e0e0;
    }
    
    .save-button {
      background-color: #3f51b5;
      border: 1px solid #3f51b5;
      color: white;
    }
    
    .save-button:hover {
      background-color: #303f9f;
    }
    
    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .layout-manager-footer {
      padding: 16px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .secondary-button, .primary-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .secondary-button {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      color: #333;
    }
    
    .secondary-button:hover {
      background-color: #e0e0e0;
    }
    
    .primary-button {
      background-color: #3f51b5;
      border: 1px solid #3f51b5;
      color: white;
    }
    
    .primary-button:hover {
      background-color: #303f9f;
    }
  `]
})
export class LayoutManagerComponent implements OnInit {
  layouts: DashboardLayout[] = [];
  currentLayoutId: string = '';
  showForm: boolean = false;
  editingLayout: string | null = null;
  newLayoutName: string = '';
  
  constructor(private dashboardStateService: DashboardStateService) {}
  
  ngOnInit(): void {
    this.loadLayouts();
    
    this.dashboardStateService.state$.subscribe(state => {
      this.currentLayoutId = state.currentLayout;
      this.layouts = state.layouts;
    });
  }
  
  loadLayouts(): void {
    const state = this.dashboardStateService.getState();
    this.layouts = state.layouts;
    this.currentLayoutId = state.currentLayout;
  }
  
  selectLayout(layoutId: string): void {
    this.currentLayoutId = layoutId;
  }
  
  setAsDefault(layoutId: string, event: MouseEvent): void {
    event.stopPropagation();
    
    // Update all layouts to remove isDefault flag
    const updatedLayouts = this.layouts.map(layout => ({
      ...layout,
      isDefault: layout.id === layoutId
    }));
    
    this.dashboardStateService.updateState({ layouts: updatedLayouts });
  }
  
  duplicateLayout(layoutId: string, event: MouseEvent): void {
    event.stopPropagation();
    
    const layoutToDuplicate = this.layouts.find(layout => layout.id === layoutId);
    if (!layoutToDuplicate) return;
    
    const newLayoutId = `layout-${Date.now()}`;
    const newLayout: DashboardLayout = {
      ...layoutToDuplicate,
      id: newLayoutId,
      name: `${layoutToDuplicate.name} (copie)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.dashboardStateService.updateState({
      layouts: [...this.layouts, newLayout]
    });
  }
  
  deleteLayout(layoutId: string, event: MouseEvent): void {
    event.stopPropagation();
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce layout ?')) {
      this.dashboardStateService.deleteLayout(layoutId);
    }
  }
  
  showNewLayoutForm(): void {
    this.editingLayout = null;
    this.newLayoutName = '';
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
    this.editingLayout = null;
    this.newLayoutName = '';
  }
  
  saveLayout(): void {
    if (!this.newLayoutName.trim()) return;
    
    if (this.editingLayout) {
      // Update existing layout
      const updatedLayouts = this.layouts.map(layout => {
        if (layout.id === this.editingLayout) {
          return {
            ...layout,
            name: this.newLayoutName,
            updatedAt: new Date()
          };
        }
        return layout;
      });
      
      this.dashboardStateService.updateState({ layouts: updatedLayouts });
    } else {
      // Create new layout
      const currentLayout = this.dashboardStateService.getCurrentLayout();
      const newLayoutId = `layout-${Date.now()}`;
      
      this.dashboardStateService.addLayout({
        id: newLayoutId,
        name: this.newLayoutName,
        widgets: currentLayout?.widgets || [],
        isDefault: false
      });
      
      this.currentLayoutId = newLayoutId;
    }
    
    this.cancelForm();
  }
  
  resetToDefault(): void {
    this.dashboardStateService.resetToDefault();
    this.loadLayouts();
  }
  
  applyChanges(): void {
    this.dashboardStateService.switchLayout(this.currentLayoutId);
    this.close();
  }
  
  close(): void {
    // This method will be implemented by the parent component
  }
}
