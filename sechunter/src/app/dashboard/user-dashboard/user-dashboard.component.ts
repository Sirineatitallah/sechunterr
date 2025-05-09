import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule,
    SidebarComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  // Track which image is currently displayed
  activeModule: 'asm' | 'vi' | 'cti' | 'soar' | null = null;

  // Image paths
  imagePaths = {
    asm: 'assets/images/asm.png',
    vi: 'assets/images/vi.png',
    cti: 'assets/images/cti.png',
    soar: 'assets/images/soar.png'
  };

  // Module display names
  moduleNames = {
    asm: 'Attack Surface Management',
    vi: 'Vulnerability Intelligence',
    cti: 'Cyber Threat Intelligence',
    soar: 'Security Orchestration, Automation & Response'
  };

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    // Default to showing no image
  }

  /**
   * Show the image for the selected module
   */
  showModule(module: 'asm' | 'vi' | 'cti' | 'soar'): void {
    this.activeModule = module;
  }

  /**
   * Handle menu selection from sidebar
   */
  handleMenuSelection(menuTitle: string): void {
    // Convert menu title to module name (lowercase and extract first word)
    const title = menuTitle.toLowerCase();

    if (title.includes('attack') || title.includes('asm')) {
      this.showModule('asm');
    } else if (title.includes('vulnerability') || title.includes('vi')) {
      this.showModule('vi');
    } else if (title.includes('cyber') || title.includes('threat') || title.includes('cti')) {
      this.showModule('cti');
    } else if (title.includes('soar') || title.includes('orchestration')) {
      this.showModule('soar');
    }
  }

  /**
   * Handle click on an image
   */
  onImageClick(): void {
    this.showSignInMessage();
  }

  /**
   * Show a stylized message about creating an account
   */
  showSignInMessage(): void {
    this.snackBar.open(
      'Create an account and sign in for details',
      'Sign In',
      {
        duration: 5000,
        panelClass: ['premium-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      }
    ).onAction().subscribe(() => {
      // Navigate to auth page when "Sign In" is clicked
      this.navigateToAuth();
    });
  }

  /**
   * Navigate to the authentication page
   */
  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
}
