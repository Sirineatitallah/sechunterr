import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

interface Asset {
  id: string;
  name: string;
  type: string;
  ip?: string;
  domain?: string;
  os?: string;
  services?: Service[];
  vulnerabilities?: number;
  exposureScore: number;
}

interface Service {
  name: string;
  port: number;
  protocol: string;
  version?: string;
  status: 'open' | 'filtered' | 'closed';
}

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss']
})
export class AssetDetailComponent {
  // Table columns
  serviceColumns: string[] = ['name', 'port', 'protocol', 'version', 'status'];
  
  constructor(
    public dialogRef: MatDialogRef<AssetDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public asset: Asset
  ) { }

  // Close dialog
  close(): void {
    this.dialogRef.close();
  }

  // Get risk class based on exposure score
  getRiskClass(): string {
    if (this.asset.exposureScore > 70) {
      return 'high-risk';
    } else if (this.asset.exposureScore > 40) {
      return 'medium-risk';
    } else {
      return 'low-risk';
    }
  }

  // Get status class
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
