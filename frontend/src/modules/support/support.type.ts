export interface SupportTicket {
  id: number;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: number; // 0 = closed, 1 = open
  department: string;
  created_by: string;
}

export interface SupportTicketDetail {
  ticket_id: number;
  department_id: number;
  department_name: string;
  created_by: string;
  status: number;
  priority: string;
  title: string;
  subject: string;
  last_updated: string;
}

export interface TicketMessage {
  id: number;
  ticket_details: SupportTicketDetail;
  sender_details: {
    id: number;
    name: string;
    image_url: string;
  };
  receiver_details: {
    id: number;
    name: string;
    image_url: string;
  } | null;
  message: {
    from: string;
    role: "customer_level" | "store_level" | "system_level";
    message: string;
    file: string | null;
    timestamp: string;
  };
}

export interface CreateTicketInput {
  department_id: number;
  title: string;
  subject: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface AddMessageInput {
  ticket_id: number;
  message?: string;
}

export interface TicketListResponse {
  data: SupportTicket[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
