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
  selector: 'app-chatbot-widget',
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
  template: `
    <div class="chatbot-widget" [class.open]="isOpen">
      <!-- Chat toggle button -->
      <button 
        class="chat-toggle-button" 
        (click)="toggleChat()"
        matTooltip="{{ isOpen ? 'Fermer le chat' : 'Ouvrir l\\'assistant' }}">
        <mat-icon>{{ isOpen ? 'close' : 'chat' }}</mat-icon>
      </button>

      <!-- Chat window -->
      <div class="chat-window">
        <!-- Chat header -->
        <div class="chat-header">
          <div class="header-info">
            <div class="bot-avatar">
              <mat-icon>security</mat-icon>
            </div>
            <div class="bot-info">
              <div class="bot-name">Assistant de Sécurité</div>
              <div class="bot-status">
                <span class="status-indicator online"></span>
                <span class="status-text">En ligne</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button mat-icon-button matTooltip="Effacer la conversation" (click)="clearChat()">
              <mat-icon>delete_sweep</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Fermer" (click)="toggleChat()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Chat messages -->
        <div class="chat-messages" #chatContainer>
          <div *ngFor="let message of messages" 
               class="message-container" 
               [ngClass]="{'user-message': message.sender === 'user', 'bot-message': message.sender === 'bot'}">
            
            <!-- Bot avatar for bot messages -->
            <div *ngIf="message.sender === 'bot'" class="message-avatar">
              <div class="avatar-icon">
                <mat-icon>security</mat-icon>
              </div>
            </div>
            
            <!-- Message content -->
            <div class="message-content">
              <!-- Loading indicator for bot typing -->
              <div *ngIf="message.isLoading" class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              
              <!-- Actual message text -->
              <div *ngIf="!message.isLoading" class="message-text">
                {{ message.content }}
              </div>
              
              <!-- Message timestamp -->
              <div class="message-time">
                {{ message.isLoading ? 'En train d\\'écrire...' : (message.timestamp | date:'HH:mm') }}
              </div>
            </div>
            
            <!-- User avatar for user messages -->
            <div *ngIf="message.sender === 'user'" class="message-avatar user">
              <div class="avatar-icon">
                <mat-icon>person</mat-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat input -->
        <div class="chat-input">
          <mat-form-field appearance="outline" class="message-field">
            <mat-label>Posez votre question...</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="newMessage" 
              #messageInput
              placeholder="Comment puis-je vous aider ?"
              (keydown)="onKeydown($event)"
              rows="1"></textarea>
          </mat-form-field>
          <button 
            mat-mini-fab 
            color="primary" 
            class="send-button" 
            [disabled]="!newMessage.trim()"
            (click)="sendMessage()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Roboto', sans-serif;
    }
    
    .chat-toggle-button {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff4500, #ff8c00);
      color: white;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      z-index: 2;
      animation: pulse 2s infinite;
    }
    
    .chat-toggle-button mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    
    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background-color: #0a0e1f;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0);
      transform-origin: bottom right;
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(10, 14, 31, 0.85);
      backdrop-filter: blur(10px);
    }
    
    .open .chat-window {
      transform: scale(1);
      opacity: 1;
    }
    
    .chat-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }
    
    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .bot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f3ff, rgba(0, 243, 255, 0.5));
      display: flex;
      justify-content: center;
      align-items: center;
      color: #0a0e1f;
    }
    
    .bot-name {
      font-size: 16px;
      font-weight: 500;
      color: white;
    }
    
    .bot-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .status-indicator.online {
      background-color: #4caf50;
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message-container {
      display: flex;
      gap: 12px;
      max-width: 100%;
    }
    
    .message-container.user-message {
      flex-direction: row-reverse;
      align-self: flex-end;
    }
    
    .message-container.bot-message {
      align-self: flex-start;
    }
    
    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .avatar-icon {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #00f3ff;
      color: #0a0e1f;
    }
    
    .avatar-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .message-avatar.user .avatar-icon {
      background: #3f51b5;
      color: white;
    }
    
    .message-content {
      max-width: 70%;
    }
    
    .message-text {
      padding: 12px;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      line-height: 1.4;
      word-break: break-word;
    }
    
    .user-message .message-text {
      background-color: rgba(63, 81, 181, 0.2);
      border-top-right-radius: 0;
    }
    
    .bot-message .message-text {
      background-color: rgba(0, 243, 255, 0.1);
      border-top-left-radius: 0;
    }
    
    .message-time {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 4px;
      padding: 0 4px;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px;
      border-radius: 12px;
      background-color: rgba(0, 243, 255, 0.1);
      border-top-left-radius: 0;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #00f3ff;
      opacity: 0.7;
      animation: typing-animation 1.5s infinite ease-in-out;
    }
    
    .dot:nth-child(1) {
      animation-delay: 0s;
    }
    
    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    .chat-input {
      padding: 12px 16px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }
    
    .message-field {
      flex: 1;
    }
    
    .send-button {
      background: linear-gradient(135deg, #3f51b5, rgba(63, 81, 181, 0.7));
    }
    
    @keyframes typing-animation {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
      }
    }
  `]
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
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
    soar: [
      'Nous avons 12 playbooks actifs pour automatiser la réponse aux incidents de sécurité.',
      'Le temps moyen de réponse aux incidents a été réduit de 45% grâce à l\'automatisation.',
      'Le playbook de réponse aux attaques de phishing a été déclenché 17 fois cette semaine.'
    ],
    help: [
      'Je peux vous aider avec des informations sur les vulnérabilités, les menaces, la surface d\'attaque, et l\'automatisation de la sécurité.',
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
    } else if (this.containsAny(lowerQuestion, ['soar', 'automatisation', 'playbook', 'workflow', 'incident', 'réponse'])) {
      return this.getRandomResponse('soar');
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
