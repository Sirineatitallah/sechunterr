import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-global-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './global-info.component.html',
  styleUrls: ['./global-info.component.scss']
})
export class GlobalInfoComponent {
  // Company information
  companyInfo = {
    name: 'SecHunter VOC',
    description: 'Managed Vulnerability Operation Center',
    founded: '2023',
    headquarters: 'Paris, France',
    website: 'https://sechunter.com'
  };

  // Contact information
  contactInfo = {
    email: 'contact@sechunter.com',
    phone: '+33 1 23 45 67 89',
    emergencyPhone: '+33 1 23 45 67 00',
    address: '123 Cybersecurity Street, 75001 Paris, France',
    supportHours: 'Monday to Friday, 9:00 AM - 6:00 PM CET'
  };

  // Social media links
  socialMedia = [
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/sechunter' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/sechunter' },
    { name: 'GitHub', icon: 'code', url: 'https://github.com/sechunter' }
  ];

  // Security services
  services = [
    {
      name: 'Vulnerability Intelligence (VI)',
      icon: 'bug_report',
      description: 'Comprehensive vulnerability scanning and management to identify and prioritize security weaknesses.'
    },
    {
      name: 'Attack Surface Management (ASM)',
      icon: 'security',
      description: 'Continuous monitoring and management of your external attack surface to reduce exposure.'
    },
    {
      name: 'Cyber Threat Intelligence (CTI)',
      icon: 'gpp_maybe',
      description: 'Real-time threat intelligence to stay ahead of emerging threats and vulnerabilities.'
    },
    {
      name: 'Security Orchestration & Response (SOAR)',
      icon: 'healing',
      description: 'Automated incident response workflows to quickly address and remediate security incidents.'
    }
  ];

  // FAQ items
  faqItems = [
    {
      question: 'What is a Managed Vulnerability Operation Center?',
      answer: 'A Managed Vulnerability Operation Center (VOC) is a specialized security service that combines vulnerability management, attack surface monitoring, threat intelligence, and automated response capabilities to provide comprehensive protection for your digital assets.'
    },
    {
      question: 'How does SecHunter protect my organization?',
      answer: 'SecHunter provides continuous monitoring of your attack surface, identifies vulnerabilities, tracks emerging threats, and automates response actions to protect your organization from cyber threats.'
    },
    {
      question: 'What types of organizations can benefit from SecHunter?',
      answer: 'Organizations of all sizes can benefit from SecHunter\'s services, from small businesses to large enterprises. Our solutions are scalable and can be tailored to meet the specific security needs of your organization.'
    },
    {
      question: 'How quickly can SecHunter respond to security incidents?',
      answer: 'With our SOAR capabilities, SecHunter can automatically respond to many security incidents within minutes. For more complex incidents, our security experts are available 24/7 to provide guidance and support.'
    },
    {
      question: 'How do I get started with SecHunter?',
      answer: 'Contact our sales team to schedule a demo and discuss your security needs. We\'ll work with you to develop a customized security solution that addresses your specific requirements.'
    }
  ];

  // Emergency contact method
  contactEmergencySupport(): void {
    // In a real application, this would open a direct line to emergency support
    // For demo purposes, we'll just log a message
    console.log('Emergency support contact initiated');
    alert('Emergency support contact initiated. In a real application, this would connect you directly with our security team.');
  }

  // Regular contact method
  contactSupport(): void {
    // In a real application, this would open a support ticket or chat
    // For demo purposes, we'll just log a message
    console.log('Support contact initiated');
    alert('Support contact initiated. In a real application, this would open a support ticket or chat.');
  }
}
