// src/app/core/models/user-interaction.model.ts
export interface UserInteraction {
  userId: string;
  action: 'view' | 'click' | 'drag' | 'filter' | 'search';
  targetId: string;
  timestamp: Date;
  data?: any;
}