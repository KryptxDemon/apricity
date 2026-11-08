export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string;
          detail: string;
          id: string;
          kind: string;
          owner_id: string;
          partnership_id: string | null;
          subject_name: string;
          topic_id: string | null;
          topic_name: string;
        };
        Insert: {
          created_at?: string;
          detail?: string;
          id?: string;
          kind: string;
          owner_id: string;
          partnership_id?: string | null;
          subject_name?: string;
          topic_id?: string | null;
          topic_name?: string;
        };
        Update: {
          created_at?: string;
          detail?: string;
          id?: string;
          kind?: string;
          owner_id?: string;
          partnership_id?: string | null;
          subject_name?: string;
          topic_id?: string | null;
          topic_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_events_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "activity_events_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_events_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          owner_id: string;
          partnership_id: string | null;
          topic_id: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          owner_id: string;
          partnership_id?: string | null;
          topic_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          owner_id?: string;
          partnership_id?: string | null;
          topic_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "notes_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      partnerships: {
        Row: {
          created_at: string;
          id: string;
          invite_code: string;
          invited_id: string | null;
          inviter_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invite_code?: string;
          invited_id?: string | null;
          inviter_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invite_code?: string;
          invited_id?: string | null;
          inviter_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partnerships_invited_id_fkey";
            columns: ["invited_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "partnerships_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      pokes: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          partnership_id: string;
          read_at: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          partnership_id: string;
          read_at?: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          partnership_id?: string;
          read_at?: string | null;
          recipient_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pokes_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pokes_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "pokes_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_seed: string;
          created_at: string;
          current_subject: string;
          display_name: string;
          presence: string;
          scenery: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_seed?: string;
          created_at?: string;
          current_subject?: string;
          display_name?: string;
          presence?: string;
          scenery?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_seed?: string;
          created_at?: string;
          current_subject?: string;
          display_name?: string;
          presence?: string;
          scenery?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          created_at: string;
          duration_minutes: number;
          ended_at: string | null;
          id: string;
          owner_id: string;
          partnership_id: string | null;
          started_at: string;
          subject_id: string | null;
          topic_id: string | null;
        };
        Insert: {
          created_at?: string;
          duration_minutes: number;
          ended_at?: string | null;
          id?: string;
          owner_id: string;
          partnership_id?: string | null;
          started_at?: string;
          subject_id?: string | null;
          topic_id?: string | null;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number;
          ended_at?: string | null;
          id?: string;
          owner_id?: string;
          partnership_id?: string | null;
          started_at?: string;
          subject_id?: string | null;
          topic_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "study_sessions_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_sessions_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_sessions_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          partnership_id: string | null;
          sort_order: number;
        };
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          partnership_id?: string | null;
          sort_order?: number;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          partnership_id?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "subjects_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
        ];
      };
      topics: {
        Row: {
          chapter: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          description: string;
          estimated_minutes: number | null;
          id: string;
          name: string;
          owner_id: string;
          parent_id: string | null;
          partnership_id: string | null;
          sort_order: number;
          subject_id: string | null;
          updated_at: string;
        };
        Insert: {
          chapter?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          description?: string;
          estimated_minutes?: number | null;
          id?: string;
          name: string;
          owner_id: string;
          parent_id?: string | null;
          partnership_id?: string | null;
          sort_order?: number;
          subject_id?: string | null;
          updated_at?: string;
        };
        Update: {
          chapter?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          description?: string;
          estimated_minutes?: number | null;
          id?: string;
          name?: string;
          owner_id?: string;
          parent_id?: string | null;
          partnership_id?: string | null;
          sort_order?: number;
          subject_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topics_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "topics_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "topics_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "topics_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_partnership_invite: {
        Args: { p_invite_code: string };
        Returns: string;
      };
      can_access_study_space: {
        Args: { p_owner_id: string; p_partnership_id: string };
        Returns: boolean;
      };
      profile_is_my_partner: { Args: { p_user_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
