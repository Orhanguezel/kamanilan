export type TicketStatus = "open" | "in_progress" | "waiting_response" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin: number;
  created_at: string;
}

export interface CreateTicketInput {
  subject: string;
  message: string;
  priority?: TicketPriority;
}

export interface AddReplyInput {
  ticket_id: string;
  message: string;
}
