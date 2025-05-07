import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() type: 'spinner' | 'skeleton' = 'spinner';
  @Input() height: string = '200px';
  @Input() width: string = '100%';
  @Input() message: string = 'Chargement des données...';
  @Input() skeletonType: 'chart' | 'table' | 'card' = 'chart';
}
