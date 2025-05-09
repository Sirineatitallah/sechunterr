import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastUpdated: Date;
  topic: string;
}

@Component({
  selector: 'app-simple-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="chatbot-container" [class.open]="isOpen">
      <!-- Chat toggle button -->
      <button class="chat-toggle-button" (click)="toggleChat()">
        <span *ngIf="!isOpen">💬</span>
        <span *ngIf="isOpen">✖</span>
      </button>

      <!-- Chat window -->
      <div class="chat-window">
        <!-- Chat header -->
        <div class="chat-header">
          <div class="header-info">
            <div class="bot-avatar">🔒</div>
            <div class="bot-info">
              <div class="bot-name">Assistant de Sécurité</div>
              <div class="bot-status">
                <span class="status-indicator online"></span>
                <span class="status-text">En ligne</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-button" (click)="toggleConversationsList()" title="Liste des conversations">📋</button>
            <button class="action-button" (click)="createNewConversation()" title="Nouvelle conversation">➕</button>
            <button class="action-button" (click)="clearChat()" title="Effacer la conversation">🧹</button>
            <button class="action-button" (click)="toggleChat()" title="Fermer">✖</button>
          </div>
        </div>

        <!-- Conversations list -->
        <div class="conversations-list" *ngIf="showConversationsList">
          <div class="conversations-header">
            <h3>Conversations</h3>
            <button class="new-conversation-button" (click)="createNewConversation()">
              Nouvelle conversation
            </button>
          </div>
          <div class="conversations-items">
            <div
              *ngFor="let conv of conversations"
              class="conversation-item"
              [class.active]="conv.id === activeConversationId"
              (click)="switchConversation(conv.id)">
              <div class="conversation-icon">
                <span *ngIf="conv.topic === 'vulnerability'">🛡️</span>
                <span *ngIf="conv.topic === 'threat'">⚠️</span>
                <span *ngIf="conv.topic === 'asm'">🔍</span>
                <span *ngIf="conv.topic === 'soar'">⚙️</span>
                <span *ngIf="!conv.topic">💬</span>
              </div>
              <div class="conversation-details">
                <div class="conversation-name">{{ conv.name }}</div>
                <div class="conversation-date">{{ conv.lastUpdated | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
              <button class="delete-conversation-button" (click)="deleteConversation(conv.id, $event)" title="Supprimer">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Chat messages -->
        <div class="chat-messages" #chatContainer>
          <div *ngFor="let message of messages"
               class="message-container"
               [ngClass]="{'user-message': message.sender === 'user', 'bot-message': message.sender === 'bot'}">

            <!-- Bot avatar for bot messages -->
            <div *ngIf="message.sender === 'bot'" class="message-avatar">
              <div class="avatar-icon">🔒</div>
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
                {{ message.isLoading ? 'En train d\'écrire...' : (message.timestamp | date:'HH:mm') }}
              </div>
            </div>

            <!-- User avatar for user messages -->
            <div *ngIf="message.sender === 'user'" class="message-avatar user">
              <div class="avatar-icon">👤</div>
            </div>
          </div>
        </div>

        <!-- Chat input -->
        <div class="chat-input">
          <input
            type="text"
            class="message-field"
            [(ngModel)]="newMessage"
            #messageInput
            placeholder="Posez votre question..."
            (keydown)="onKeydown($event)">
          <button
            class="send-button"
            [disabled]="!newMessage.trim()"
            (click)="sendMessage()">
            📤
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: 'Roboto', sans-serif;
    }

    .chat-toggle-button {
      width: 60px;
      height: 60px;
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
      font-size: 24px;
    }

    .chat-window {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 320px;
      height: 450px;
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
      background: rgba(10, 14, 31, 0.95);
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
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f3ff, rgba(0, 243, 255, 0.5));
      display: flex;
      justify-content: center;
      align-items: center;
      color: #0a0e1f;
      font-size: 20px;
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

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Conversations list */
    .conversations-list {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(10, 14, 31, 0.95);
      z-index: 10;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.2s ease;
    }

    .conversations-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .conversations-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: white;
    }

    .new-conversation-button {
      background-color: rgba(63, 81, 181, 0.2);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .new-conversation-button:hover {
      background-color: rgba(63, 81, 181, 0.4);
    }

    .conversations-items {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 8px;
      background-color: rgba(255, 255, 255, 0.05);
    }

    .conversation-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .conversation-item.active {
      background-color: rgba(63, 81, 181, 0.2);
      border-left: 3px solid #3f51b5;
    }

    .conversation-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
    }

    .conversation-details {
      flex: 1;
    }

    .conversation-name {
      font-size: 14px;
      font-weight: 500;
      color: white;
      margin-bottom: 4px;
    }

    .conversation-date {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .delete-conversation-button {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 16px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .conversation-item:hover .delete-conversation-button {
      opacity: 1;
    }

    .delete-conversation-button:hover {
      color: #ff4500;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
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
      font-size: 16px;
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
      align-items: center;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);
    }

    .message-field {
      flex: 1;
      padding: 10px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: white;
      outline: none;
    }

    .message-field::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .send-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3f51b5, rgba(63, 81, 181, 0.7));
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes typing-animation {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
  `]
})
export class SimpleChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  isOpen = true; // Start with the chat window open
  conversations: Conversation[] = [];
  activeConversationId: string = '';
  newMessage = '';
  isTyping = false;
  showConversationsList = false;

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
    // Create a default conversation
    this.createNewConversation();
  }

  // Create a new conversation
  createNewConversation(): void {
    const newId = 'conv_' + Date.now();
    const newConversation: Conversation = {
      id: newId,
      name: 'Nouvelle conversation',
      messages: [],
      lastUpdated: new Date(),
      topic: ''
    };

    this.conversations.push(newConversation);
    this.activeConversationId = newId;

    // Add welcome message to the new conversation
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

    // If there's no active conversation, create one
    if (!this.getActiveConversation()) {
      this.createNewConversation();
    }

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

    const conversation = this.getActiveConversation();
    if (conversation) {
      conversation.messages.push(loadingMessage);
    }

    // Simulate processing time
    setTimeout(() => {
      // Get the active conversation again in case it changed
      const activeConv = this.getActiveConversation();
      if (activeConv) {
        // Remove the loading message
        activeConv.messages = activeConv.messages.filter(m => !m.isLoading);

        // Add bot response
        this.addBotMessage(this.generateResponse(userQuestion));
      }

      this.isTyping = false;
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  private addUserMessage(content: string): void {
    const conversation = this.getActiveConversation();
    if (!conversation) return;

    conversation.messages.push({
      content,
      sender: 'user',
      timestamp: new Date()
    });

    conversation.lastUpdated = new Date();
    this.updateConversationName(content);
  }

  private addBotMessage(content: string): void {
    const conversation = this.getActiveConversation();
    if (!conversation) return;

    conversation.messages.push({
      content,
      sender: 'bot',
      timestamp: new Date()
    });

    conversation.lastUpdated = new Date();
  }

  // Get the active conversation
  private getActiveConversation(): Conversation | undefined {
    return this.conversations.find(conv => conv.id === this.activeConversationId);
  }

  // Get messages from the active conversation
  get messages(): ChatMessage[] {
    const conversation = this.getActiveConversation();
    return conversation ? conversation.messages : [];
  }

  // Update conversation name based on the content of the message
  private updateConversationName(content: string): void {
    const conversation = this.getActiveConversation();
    if (!conversation) return;

    // Only update name if it's still the default or if we have a better topic
    if (conversation.name === 'Nouvelle conversation' || !conversation.topic) {
      // Determine the topic based on the content
      const lowerContent = content.toLowerCase();

      if (this.containsAny(lowerContent, ['vulnérabilité', 'vulnerabilite', 'cve', 'faille', 'patch', 'correctif'])) {
        conversation.topic = 'vulnerability';
        conversation.name = 'Vulnérabilités';
      } else if (this.containsAny(lowerContent, ['menace', 'threat', 'attaque', 'malware', 'ransomware', 'phishing'])) {
        conversation.topic = 'threat';
        conversation.name = 'Menaces';
      } else if (this.containsAny(lowerContent, ['surface', 'asm', 'exposition', 'exposé', 'asset', 'actif'])) {
        conversation.topic = 'asm';
        conversation.name = 'Surface d\'attaque';
      } else if (this.containsAny(lowerContent, ['soar', 'automatisation', 'playbook', 'workflow', 'incident', 'réponse'])) {
        conversation.topic = 'soar';
        conversation.name = 'Automatisation';
      } else if (conversation.messages.length <= 2) {
        // If it's the first user message and we couldn't determine a topic,
        // use the first few words of the message as the name
        const words = content.split(' ').filter(word => word.length > 2);
        if (words.length > 0) {
          const nameWords = words.slice(0, 3);
          const name = nameWords.join(' ');
          conversation.name = name.charAt(0).toUpperCase() + name.slice(1);
          if (conversation.name.length > 25) {
            conversation.name = conversation.name.substring(0, 22) + '...';
          }
        }
      }
    }
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

  // Clear current conversation
  clearChat(): void {
    const conversation = this.getActiveConversation();
    if (conversation) {
      conversation.messages = [];
      this.addBotMessage(this.getRandomResponse('greeting'));
    }
  }

  // Switch to a conversation
  switchConversation(conversationId: string): void {
    this.activeConversationId = conversationId;
    this.showConversationsList = false;
  }

  // Delete a conversation
  deleteConversation(conversationId: string, event: Event): void {
    event.stopPropagation(); // Prevent switching to the conversation when clicking delete

    // Remove the conversation
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);

    // If we deleted the active conversation, switch to another one or create a new one
    if (this.activeConversationId === conversationId) {
      if (this.conversations.length > 0) {
        this.activeConversationId = this.conversations[0].id;
      } else {
        this.createNewConversation();
      }
    }
  }

  // Toggle conversations list
  toggleConversationsList(): void {
    this.showConversationsList = !this.showConversationsList;
  }
}
