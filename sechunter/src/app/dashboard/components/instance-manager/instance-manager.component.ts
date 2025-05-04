import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
interface Client {
  id: number;
  name: string;
  status: 'OK' | 'Alert';
}

@Component({
  selector: 'app-instance-manager',
  templateUrl: './instance-manager.component.html',
  styleUrls: ['./instance-manager.component.scss'],
  standalone: true,
imports: [CommonModule]
})
export class InstanceManagerComponent {
  clients: Client[] = [
    { id: 1, name: 'Client A', status: 'OK' },
    { id: 2, name: 'Client B', status: 'Alert' },
    { id: 3, name: 'Client C', status: 'OK' }
  ];

  @Output() aggregateInstance = new EventEmitter<void>();

  onAggregateInstance() {
    this.aggregateInstance.emit();
  }

  onSelectClient(client: Client) {
    console.log('Selected client:', client);
    // Implement client selection logic here
  }
}
