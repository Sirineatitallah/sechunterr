import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatRippleModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  isOpen = true; // Start with the chat window open
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  // Predefined responses for different types of questions
  private responses: { [key: string]: string[] } = {
    greeting: [
      'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      'Salut ! Je suis votre assistant de sécurité. Que puis-je faire pour vous ?',
      'Bienvenue ! Je suis là pour répondre à vos questions sur la sécurité.'
    ],
    vulnerability: [
      'Nous avons détecté 127 vulnérabilités dans votre système, dont 23 critiques qui nécessitent une attention immédiate.',
      'Les vulnérabilités les plus critiques concernent des failles dans vos serveurs web et des services exposés.',
      'Je recommande de prioriser les correctifs pour CVE-2023-1234 et CVE-2023-5678 qui présentent les risques les plus élevés.'
    ],
    threat: [
      'Nous surveillons actuellement plusieurs menaces APT qui ciblent votre secteur d\'activité.',
      'Les indicateurs de compromission récents incluent des domaines malveillants et des signatures de malware spécifiques.',
      'Notre système a bloqué 47 tentatives d\'attaque au cours des dernières 24 heures.'
    ],
    asm: [
      'Votre surface d\'attaque comprend 342 actifs exposés, dont 78 présentent des risques élevés.',
      'Les principaux points d\'exposition incluent des ports ouverts non nécessaires et des services mal configurés.',
      'Je recommande de réduire votre surface d\'attaque en désactivant les services non essentiels et en mettant à jour vos configurations.'
    ],

    help: [
      'Je peux vous aider avec des informations sur les vulnérabilités, les menaces et la surface d\'attaque.',
      'Vous pouvez me demander des statistiques, des recommandations, ou des explications sur les alertes de sécurité.',
      'N\'hésitez pas à poser des questions spécifiques sur vos préoccupations en matière de sécurité.'
    ],
    default: [
      'Je comprends votre question. Laissez-moi analyser les données pertinentes...',
      'Voici ce que je peux vous dire sur ce sujet en fonction de nos données actuelles.',
      'Basé sur notre analyse, voici les informations que je peux partager.'
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // Add welcome message
    this.addBotMessage(this.getRandomResponse('greeting'));
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Add user message
    this.addUserMessage(this.newMessage);
    const userQuestion = this.newMessage;
    this.newMessage = '';

    // Show typing indicator
    this.isTyping = true;

    // Add a loading message from the bot
    const loadingMessage: ChatMessage = {
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true
    };
    this.messages.push(loadingMessage);

    // Simulate processing time
    setTimeout(() => {
      // Remove the loading message
      this.messages = this.messages.filter(m => !m.isLoading);

      // Add bot response
      this.addBotMessage(this.generateResponse(userQuestion));
      this.isTyping = false;
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      sender: 'user',
      timestamp: new Date()
    });
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      sender: 'bot',
      timestamp: new Date()
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private generateResponse(question: string): string {
    // Convert question to lowercase for easier matching
    const lowerQuestion = question.toLowerCase();

    // Check for different types of questions
    if (this.containsAny(lowerQuestion, ['bonjour', 'salut', 'hello', 'hi', 'hey'])) {
      return this.getRandomResponse('greeting');
    } else if (this.containsAny(lowerQuestion, ['vulnérabilité', 'vulnerabilite', 'cve', 'faille', 'patch', 'correctif'])) {
      return this.getRandomResponse('vulnerability');
    } else if (this.containsAny(lowerQuestion, ['menace', 'threat', 'attaque', 'malware', 'ransomware', 'phishing'])) {
      return this.getRandomResponse('threat');
    } else if (this.containsAny(lowerQuestion, ['surface', 'asm', 'exposition', 'exposé', 'asset', 'actif'])) {
      return this.getRandomResponse('asm');
    } else if (this.containsAny(lowerQuestion, ['incident', 'réponse'])) {
      return this.getRandomResponse('default');
    } else if (this.containsAny(lowerQuestion, ['aide', 'help', 'comment', 'quoi', 'que'])) {
      return this.getRandomResponse('help');
    } else {
      return this.getRandomResponse('default');
    }
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses['default'];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Handle Enter key press
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Clear chat history
  clearChat(): void {
    this.messages = [];
    this.addBotMessage(this.getRandomResponse('greeting'));
  }
}
