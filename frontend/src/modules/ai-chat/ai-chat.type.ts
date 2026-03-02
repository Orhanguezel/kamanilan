export interface AiChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface AiChatSendResponse {
  session_id: string;
  message: string;
}

export interface AiChatStatusResponse {
  enabled: boolean;
  model: string | null;
}
