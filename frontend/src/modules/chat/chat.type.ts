export interface Conversation {
  id: string;
  user_a: string;
  user_b: string;
  property_id: string | null;
  last_message_at: string;
  created_at: string;
  // enriched fields from backend
  last_message: ChatMessage | null;
  unread_count: number;
  other_user_id: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: number; // 0 | 1
  created_at: string;
}
