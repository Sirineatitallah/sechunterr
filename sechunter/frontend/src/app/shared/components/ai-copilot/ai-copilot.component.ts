import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-copilot',
  templateUrl: './ai-copilot.component.html',
  styleUrls: ['./ai-copilot.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AiCopilotComponent {
  isOpen = false;
  messages: string[] = [
    'Je peux g�n�rer un rapport ASM pour vous',
    'Demandez-moi d\'ex�cuter une action rapide',
    'Besoin d\'aide ? Je suis l� pour vous guider'
  ];

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
