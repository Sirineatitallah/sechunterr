import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

interface Playbook {
  id: string;
  name: string;
  type: string;
  executions: number;
  successRate: number;
  avgDuration: string;
  lastRun: Date;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-active-playbooks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './active-playbooks.component.html',
  styleUrls: ['./active-playbooks.component.scss']
})
export class ActivePlaybooksComponent implements OnInit, OnDestroy {
  // Playbooks data
  playbooks: Playbook[] = [];
  filteredPlaybooks: Playbook[] = [];
  
  // Table columns
  displayedColumns: string[] = ['name', 'type', 'executions', 'successRate', 'avgDuration', 'lastRun', 'status', 'actions'];
  
  // Filter state
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) { }

  ngOnInit(): void {
    // Load initial data
    this.loadData();
    
    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(() => {
        this.loadData();
        this.applyFilter(this.activeFilter);
      })
    );
    
    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.applyFilter(this.activeFilter);
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load playbooks data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.playbooks = [
      {
        id: 'PB-001',
        name: 'Anti-Phishing',
        type: 'Email Security',
        executions: 50,
        successRate: 95,
        avgDuration: '15m',
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'active'
      },
      {
        id: 'PB-002',
        name: 'Malware Containment',
        type: 'Endpoint Security',
        executions: 35,
        successRate: 88,
        avgDuration: '45m',
        lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: 'active'
      },
      {
        id: 'PB-003',
        name: 'DDoS Mitigation',
        type: 'Network Security',
        executions: 12,
        successRate: 92,
        avgDuration: '30m',
        lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        status: 'active'
      },
      {
        id: 'PB-004',
        name: 'User Account Compromise',
        type: 'Identity Security',
        executions: 28,
        successRate: 85,
        avgDuration: '1h 15m',
        lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        status: 'active'
      },
      {
        id: 'PB-005',
        name: 'Data Exfiltration',
        type: 'Data Security',
        executions: 8,
        successRate: 75,
        avgDuration: '2h',
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        status: 'inactive'
      },
      {
        id: 'PB-006',
        name: 'Ransomware Response',
        type: 'Endpoint Security',
        executions: 5,
        successRate: 80,
        avgDuration: '3h 30m',
        lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        status: 'inactive'
      }
    ];
    
    // Apply initial filter
    this.applyFilter(this.activeFilter);
  }

  // Apply filter
  applyFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.activeFilter = filter;
    
    if (filter === 'all') {
      this.filteredPlaybooks = [...this.playbooks];
    } else {
      this.filteredPlaybooks = this.playbooks.filter(playbook => playbook.status === filter);
    }
  }

  // Sort data
  sortData(sort: Sort): void {
    const data = [...this.filteredPlaybooks];
    
    if (!sort.active || sort.direction === '') {
      this.filteredPlaybooks = data;
      return;
    }
    
    this.filteredPlaybooks = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'type': return this.compare(a.type, b.type, isAsc);
        case 'executions': return this.compare(a.executions, b.executions, isAsc);
        case 'successRate': return this.compare(a.successRate, b.successRate, isAsc);
        case 'avgDuration': return this.compare(this.durationToMinutes(a.avgDuration), this.durationToMinutes(b.avgDuration), isAsc);
        case 'lastRun': return this.compare(a.lastRun.getTime(), b.lastRun.getTime(), isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }

  // Compare function for sorting
  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Convert duration string to minutes for sorting
  private durationToMinutes(duration: string): number {
    const hours = duration.includes('h') ? parseInt(duration.split('h')[0]) : 0;
    const minutes = duration.includes('m') ? parseInt(duration.split('m')[0].split(' ').pop() || '0') : 0;
    return hours * 60 + minutes;
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
  }

  // Format date
  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get success rate class
  getSuccessRateClass(rate: number): string {
    if (rate >= 90) {
      return 'high';
    } else if (rate >= 70) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Launch playbook
  launchPlaybook(playbook: Playbook): void {
    console.log('Launching playbook:', playbook);
    // In a real application, this would trigger the playbook execution
    alert(`Playbook ${playbook.name} launched!`);
  }

  // Edit playbook
  editPlaybook(playbook: Playbook): void {
    console.log('Editing playbook:', playbook);
    // In a real application, this would open the playbook editor
  }

  // Get count by status
  getCountByStatus(status: 'active' | 'inactive'): number {
    return this.playbooks.filter(playbook => playbook.status === status).length;
  }

  // Get total executions
  getTotalExecutions(): number {
    return this.playbooks.reduce((sum, playbook) => sum + playbook.executions, 0);
  }

  // Get average success rate
  getAverageSuccessRate(): number {
    const total = this.playbooks.reduce((sum, playbook) => sum + playbook.successRate, 0);
    return Math.round(total / this.playbooks.length);
  }
}
