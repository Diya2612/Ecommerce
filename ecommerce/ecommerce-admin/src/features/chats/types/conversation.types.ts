export type ConversationStatus = 'open' | 'pending' | 'solved' | 'urgent';
export type ConversationPriority = 'high' | 'urgent' | 'normal' | 'low';

export interface ConversationTag {
  id: string;
  label: string;
  color: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  subject: string;
  preview: string;
  status: ConversationStatus;
  priority?: ConversationPriority;
  tags: ConversationTag[];
  created_at: string;
  updated_at: string;
  unreadCount?: number;
}
