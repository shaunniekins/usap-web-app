export interface User {
  uuid: string;
  is_searching: boolean;
  current_session: string | null; // Changed from optional string to string | null
  last_seen?: Date;
}

export interface ChatSession {
  id: string;
  users: string[];
  created_at: Date;
  active: boolean;
}

export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  timestamp: Date;
}
