import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

interface MitreTactic {
  id: string;
  name: string;
  techniques: MitreTechnique[];
}

interface MitreTechnique {
  id: string;
  name: string;
  count: number;
}

@Component({
  selector: 'app-mitre-heatmap',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './mitre-heatmap.component.html',
  styleUrls: ['./mitre-heatmap.component.scss']
})
export class MitreHeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heatmapContainer') heatmapContainer!: ElementRef;

  // MITRE ATT&CK data
  tactics: MitreTactic[] = [];
  selectedTechnique: MitreTechnique | null = null;

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
        this.renderHeatmap();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.renderHeatmap();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Render heatmap
    setTimeout(() => {
      this.renderHeatmap();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load MITRE ATT&CK data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.tactics = [
      {
        id: 'TA0001',
        name: 'Initial Access',
        techniques: [
          { id: 'T1566', name: 'Phishing', count: 120 },
          { id: 'T1190', name: 'Exploit Public-Facing Application', count: 85 },
          { id: 'T1133', name: 'External Remote Services', count: 45 }
        ]
      },
      {
        id: 'TA0002',
        name: 'Execution',
        techniques: [
          { id: 'T1059', name: 'Command and Scripting Interpreter', count: 95 },
          { id: 'T1204', name: 'User Execution', count: 75 },
          { id: 'T1047', name: 'Windows Management Instrumentation', count: 30 }
        ]
      },
      {
        id: 'TA0003',
        name: 'Persistence',
        techniques: [
          { id: 'T1098', name: 'Account Manipulation', count: 65 },
          { id: 'T1547', name: 'Boot or Logon Autostart Execution', count: 55 },
          { id: 'T1136', name: 'Create Account', count: 40 }
        ]
      },
      {
        id: 'TA0004',
        name: 'Privilege Escalation',
        techniques: [
          { id: 'T1068', name: 'Exploitation for Privilege Escalation', count: 70 },
          { id: 'T1484', name: 'Domain Policy Modification', count: 50 },
          { id: 'T1055', name: 'Process Injection', count: 35 }
        ]
      },
      {
        id: 'TA0005',
        name: 'Defense Evasion',
        techniques: [
          { id: 'T1027', name: 'Obfuscated Files or Information', count: 110 },
          { id: 'T1070', name: 'Indicator Removal', count: 80 },
          { id: 'T1036', name: 'Masquerading', count: 60 }
        ]
      },
      {
        id: 'TA0006',
        name: 'Credential Access',
        techniques: [
          { id: 'T1110', name: 'Brute Force', count: 90 },
          { id: 'T1555', name: 'Credentials from Password Stores', count: 65 },
          { id: 'T1556', name: 'Modify Authentication Process', count: 40 }
        ]
      },
      {
        id: 'TA0007',
        name: 'Discovery',
        techniques: [
          { id: 'T1087', name: 'Account Discovery', count: 75 },
          { id: 'T1082', name: 'System Information Discovery', count: 60 },
          { id: 'T1016', name: 'System Network Configuration Discovery', count: 45 }
        ]
      },
      {
        id: 'TA0008',
        name: 'Lateral Movement',
        techniques: [
          { id: 'T1021', name: 'Remote Services', count: 85 },
          { id: 'T1091', name: 'Replication Through Removable Media', count: 40 },
          { id: 'T1072', name: 'Software Deployment Tools', count: 30 }
        ]
      }
    ];
  }

  // Render MITRE ATT&CK heatmap
  renderHeatmap(): void {
    if (!this.heatmapContainer || !this.tactics.length) return;

    // Clear previous heatmap
    d3.select(this.heatmapContainer.nativeElement).selectAll('*').remove();

    // Get container dimensions
    const containerWidth = this.heatmapContainer.nativeElement.clientWidth;
    const containerHeight = this.heatmapContainer.nativeElement.clientHeight;

    // Set dimensions
    const margin = { top: 50, right: 20, bottom: 20, left: 150 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(this.heatmapContainer.nativeElement)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const data: any[] = [];
    this.tactics.forEach(tactic => {
      tactic.techniques.forEach(technique => {
        data.push({
          tactic: tactic.name,
          technique: technique.name,
          count: technique.count,
          id: technique.id
        });
      });
    });

    // Get unique tactics and techniques
    const tactics = Array.from(new Set(data.map(d => d.tactic)));
    const techniques = Array.from(new Set(data.map(d => d.technique)));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(techniques)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(tactics)
      .range([0, height])
      .padding(0.05);

    // Color scale
    const maxCount = d3.max(data, d => d.count) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, maxCount]);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(16, 18, 27, 0.9)')
      .style('border', '1px solid rgba(0, 243, 255, 0.3)')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('color', '#ffffff')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)');

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '10px')
      .style('fill', '#a8a3a3');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#a8a3a3');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#ffffff')
      .text('MITRE ATT&CK Heatmap');

    // Add cells
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.technique) || 0)
      .attr('y', d => yScale(d.tactic) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScale(d.count))
      .style('stroke', 'rgba(0, 0, 0, 0.2)')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 5px;">${d.technique} (${d.id})</div>
          <div style="margin-bottom: 5px;">Tactic: ${d.tactic}</div>
          <div>Alertes: ${d.count}</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', (event, d) => {
        // Find the technique in the tactics array
        const technique = this.findTechnique(d.id);
        if (technique) {
          this.selectedTechnique = technique;
        }
      });

    // Add count text
    svg.selectAll('text.count-text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'count-text')
      .attr('x', d => (xScale(d.technique) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.tactic) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', d => this.getTextColor(d.count, maxCount))
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .text(d => d.count);
  }

  // Find technique by ID
  findTechnique(id: string): MitreTechnique | null {
    for (const tactic of this.tactics) {
      const technique = tactic.techniques.find(t => t.id === id);
      if (technique) {
        return technique;
      }
    }
    return null;
  }

  // Get text color based on background color
  getTextColor(count: number, maxCount: number): string {
    // Use white text for darker cells, black text for lighter cells
    return count > maxCount / 2 ? '#ffffff' : '#000000';
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.renderHeatmap();
  }

  // Clear selected technique
  clearSelection(): void {
    this.selectedTechnique = null;
  }
}
