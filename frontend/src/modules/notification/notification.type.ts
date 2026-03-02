export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string; // "system" | "chat" | "listing" etc.
  is_read: boolean;
  created_at: string;
}
