import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisualizationSelectionService {
  private selectedTabSubject = new BehaviorSubject<string>('Vulnérabilités');
  selectedTab$ = this.selectedTabSubject.asObservable();

  setSelectedTab(tab: string): void {
    this.selectedTabSubject.next(tab);
  }
}
