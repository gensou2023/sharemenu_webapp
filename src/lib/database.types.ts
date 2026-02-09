export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type SessionStatus = "active" | "completed";
export type ApiType = "chat" | "image_gen";
export type ApiStatus = "success" | "error";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: UserRole;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          password_hash?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: SessionStatus;
          shop_name: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          status?: SessionStatus;
          shop_name?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          status?: SessionStatus;
          shop_name?: string | null;
          category?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "ai";
          content: string;
          proposal_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "ai";
          content: string;
          proposal_json?: Json | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          proposal_json?: Json | null;
        };
      };
      generated_images: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          storage_path: string;
          prompt: string;
          aspect_ratio: string;
          proposal_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          storage_path: string;
          prompt: string;
          aspect_ratio?: string;
          proposal_json?: Json | null;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
        };
      };
      prompt_templates: {
        Row: {
          id: string;
          name: string;
          content: string;
          version: number;
          is_active: boolean;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          version?: number;
          is_active?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          content?: string;
          version?: number;
          is_active?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      reference_images: {
        Row: {
          id: string;
          storage_path: string;
          label: string;
          category: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          label: string;
          category?: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          label?: string;
          category?: string;
        };
      };
      api_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          api_type: ApiType;
          model: string;
          tokens_in: number | null;
          tokens_out: number | null;
          duration_ms: number | null;
          status: ApiStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          api_type: ApiType;
          model: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
          duration_ms?: number | null;
          status?: ApiStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          status?: ApiStatus;
          error_message?: string | null;
        };
      };
    };
  };
}
