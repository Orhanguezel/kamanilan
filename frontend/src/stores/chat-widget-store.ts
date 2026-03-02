import { create } from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatWidgetStore {
  isOpen: boolean;
  messages: ChatMessage[];
  sessionId: string | null;
  isTyping: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  setSessionId: (id: string) => void;
  clearMessages: () => void;
}

export const useChatWidgetStore = create<ChatWidgetStore>((set) => ({
  isOpen: false,
  messages: [],
  sessionId: null,
  isTyping: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setTyping: (typing) => set({ isTyping: typing }),
  setSessionId: (id) => set({ sessionId: id }),
  clearMessages: () => set({ messages: [], sessionId: null }),
}));
