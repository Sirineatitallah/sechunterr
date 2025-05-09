import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  // Current selected module
  currentModule: 'asm' | 'vi' | 'cti' | 'soar' | null = null;

  // Image paths
  imagePaths = {
    asm: 'assets/images/asm.png',
    vi: 'assets/images/vi.png',
    cti: 'assets/images/cti.png',
    soar: 'assets/images/soar.png'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Get the current route to determine which module is selected
    const currentUrl = this.router.url;

    if (currentUrl.includes('/dashboard/asm')) {
      this.currentModule = 'asm';
    } else if (currentUrl.includes('/dashboard/vi')) {
      this.currentModule = 'vi';
    } else if (currentUrl.includes('/dashboard/cti')) {
      this.currentModule = 'cti';
    } else if (currentUrl.includes('/dashboard/soar')) {
      this.currentModule = 'soar';
    }

    // Also subscribe to route changes
    this.route.url.subscribe(() => {
      const updatedUrl = this.router.url;

      if (updatedUrl.includes('/dashboard/asm')) {
        this.currentModule = 'asm';
      } else if (updatedUrl.includes('/dashboard/vi')) {
        this.currentModule = 'vi';
      } else if (updatedUrl.includes('/dashboard/cti')) {
        this.currentModule = 'cti';
      } else if (updatedUrl.includes('/dashboard/soar')) {
        this.currentModule = 'soar';
      } else {
        this.currentModule = null;
      }
    });
  }

  // Show message when image is clicked
  showSignInMessage(): void {
    alert('Create an account and sign in for details');
  }

  // Get current image path based on selected module
  get currentImagePath(): string {
    return this.currentModule ? this.imagePaths[this.currentModule] : '';
  }
}
