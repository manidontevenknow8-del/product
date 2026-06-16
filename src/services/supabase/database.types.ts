export type SubscriptionTier = 'free' | 'premium' | 'family';

export type PetRow = {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ReminderRow = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
  notes: string | null;
  priority: string;
  recurring: string;
  completed: boolean;
  completed_at: string | null;
  source_health_record_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PetDocumentRow = {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  uploaded_at: string;
  created_at: string;
};

export type DailyCheckInRow = {
  id: string;
  pet_id: string;
  check_in_date: string;
  feeding: string;
  walk_distance_km: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthRecordRow = {
  id: string;
  pet_id: string;
  source_document_id: string | null;
  record_type: string;
  title: string;
  description: string | null;
  date_recorded: string;
  next_due_date: string | null;
  severity: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  subscription_tier: SubscriptionTier;
  subscription_plan: string;
  subscription_status: string;
  founding_member: boolean;
  founding_trial_ends_at: string | null;
  promo_trial_ends_at: string | null;
  founding_lifetime_discount: boolean;
  notification_preferences: Record<string, boolean> | null;
  created_at: string;
  updated_at: string;
};

export type EmailJobRow = {
  id: string;
  user_id: string;
  email_type: string;
  payload: Record<string, unknown>;
  scheduled_for: string;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
};

export type EmailSendLogRow = {
  id: string;
  user_id: string;
  email_type: string;
  dedup_key: string;
  recipient_email: string;
  resend_id: string | null;
  sent_at: string;
};

export type VetBillExtractionRow = {
  id: string;
  user_id: string;
  pet_id: string;
  document_id: string;
  status: string;
  extraction_result: Record<string, unknown>;
  approved_snapshot: Record<string, unknown> | null;
  model_used: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_interval: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WebhookEventRow = {
  id: string;
  payload: Record<string, unknown>;
  processed_at: string;
};

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  published_at: string | null;
  featured_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SpeciesRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type BreedRow = {
  id: string;
  species_id: string;
  slug: string;
  name: string;
  description: string | null;
  size_category: string | null;
  created_at: string;
  updated_at: string;
};

export type CareGuidelineRow = {
  id: string;
  species_id: string;
  breed_id: string | null;
  lifespan: unknown;
  diet: unknown;
  exercise_needs: unknown;
  common_conditions: unknown;
  vaccination_guidance: unknown;
  seasonal_considerations: unknown;
  source: string | null;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          email: string;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          subscription_tier?: SubscriptionTier;
          subscription_plan?: string;
          subscription_status?: string;
          founding_member?: boolean;
          founding_trial_ends_at?: string | null;
          promo_trial_ends_at?: string | null;
          founding_lifetime_discount?: boolean;
          notification_preferences?: Record<string, boolean> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          email?: string;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          subscription_tier?: SubscriptionTier;
          subscription_plan?: string;
          subscription_status?: string;
          founding_member?: boolean;
          founding_trial_ends_at?: string | null;
          promo_trial_ends_at?: string | null;
          founding_lifetime_discount?: boolean;
          notification_preferences?: Record<string, boolean> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: PetRow;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species: string;
          breed?: string | null;
          birth_date?: string | null;
          weight?: string | null;
          gender?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: string;
          breed?: string | null;
          birth_date?: string | null;
          weight?: string | null;
          gender?: string | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: ReminderRow;
        Insert: {
          id?: string;
          pet_id: string;
          title: string;
          category: string;
          due_date: string;
          notes?: string | null;
          priority: string;
          recurring?: string;
          completed?: boolean;
          completed_at?: string | null;
          source_health_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          title?: string;
          category?: string;
          due_date?: string;
          notes?: string | null;
          priority?: string;
          recurring?: string;
          completed?: boolean;
          completed_at?: string | null;
          source_health_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reminders_pet_id_fkey';
            columns: ['pet_id'];
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminders_source_health_record_id_fkey';
            columns: ['source_health_record_id'];
            referencedRelation: 'health_records';
            referencedColumns: ['id'];
          },
        ];
      };
      pet_documents: {
        Row: PetDocumentRow;
        Insert: {
          id?: string;
          pet_id: string;
          file_name: string;
          file_type: string;
          storage_path: string;
          uploaded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          file_name?: string;
          file_type?: string;
          storage_path?: string;
          uploaded_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pet_documents_pet_id_fkey';
            columns: ['pet_id'];
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_check_ins: {
        Row: DailyCheckInRow;
        Insert: {
          id?: string;
          pet_id: string;
          check_in_date: string;
          feeding: string;
          walk_distance_km?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          check_in_date?: string;
          feeding?: string;
          walk_distance_km?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_check_ins_pet_id_fkey';
            columns: ['pet_id'];
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
      health_records: {
        Row: HealthRecordRow;
        Insert: {
          id?: string;
          pet_id: string;
          source_document_id?: string | null;
          record_type: string;
          title: string;
          description?: string | null;
          date_recorded: string;
          next_due_date?: string | null;
          severity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          source_document_id?: string | null;
          record_type?: string;
          title?: string;
          description?: string | null;
          date_recorded?: string;
          next_due_date?: string | null;
          severity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'health_records_pet_id_fkey';
            columns: ['pet_id'];
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'health_records_source_document_id_fkey';
            columns: ['source_document_id'];
            referencedRelation: 'pet_documents';
            referencedColumns: ['id'];
          },
        ];
      };
      email_jobs: {
        Row: EmailJobRow;
        Insert: {
          id?: string;
          user_id: string;
          email_type: string;
          payload?: Record<string, unknown>;
          scheduled_for: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_type?: string;
          payload?: Record<string, unknown>;
          scheduled_for?: string;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      email_send_log: {
        Row: EmailSendLogRow;
        Insert: {
          id?: string;
          user_id: string;
          email_type: string;
          dedup_key: string;
          recipient_email: string;
          resend_id?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_type?: string;
          dedup_key?: string;
          recipient_email?: string;
          resend_id?: string | null;
          sent_at?: string;
        };
        Relationships: [];
      };
      vet_bill_extractions: {
        Row: VetBillExtractionRow;
        Insert: {
          id?: string;
          user_id: string;
          pet_id: string;
          document_id: string;
          status?: string;
          extraction_result: Record<string, unknown>;
          approved_snapshot?: Record<string, unknown> | null;
          model_used?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pet_id?: string;
          document_id?: string;
          status?: string;
          extraction_result?: Record<string, unknown>;
          approved_snapshot?: Record<string, unknown> | null;
          model_used?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          status: string;
          billing_interval?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          started_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          status?: string;
          billing_interval?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          started_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: WebhookEventRow;
        Insert: {
          id: string;
          payload: Record<string, unknown>;
          processed_at?: string;
        };
        Update: {
          id?: string;
          payload?: Record<string, unknown>;
          processed_at?: string;
        };
        Relationships: [];
      };
      referral_codes: {
        Row: { id: string; user_id: string; code: string; created_at: string };
        Insert: { id?: string; user_id: string; code: string; created_at?: string };
        Update: { id?: string; user_id?: string; code?: string; created_at?: string };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          inviter_user_id: string;
          referral_code: string;
          invitee_email: string | null;
          invitee_user_id: string | null;
          referral_source: string | null;
          status: string;
          invited_at: string;
          signed_up_at: string | null;
          converted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inviter_user_id: string;
          referral_code: string;
          invitee_email?: string | null;
          invitee_user_id?: string | null;
          referral_source?: string | null;
          status?: string;
          invited_at?: string;
          signed_up_at?: string | null;
          converted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inviter_user_id?: string;
          referral_code?: string;
          invitee_email?: string | null;
          invitee_user_id?: string | null;
          referral_source?: string | null;
          status?: string;
          invited_at?: string;
          signed_up_at?: string | null;
          converted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      species: {
        Row: SpeciesRow;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      breeds: {
        Row: BreedRow;
        Insert: {
          id?: string;
          species_id: string;
          slug: string;
          name: string;
          description?: string | null;
          size_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          species_id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          size_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'breeds_species_id_fkey';
            columns: ['species_id'];
            referencedRelation: 'species';
            referencedColumns: ['id'];
          },
        ];
      };
      care_guidelines: {
        Row: CareGuidelineRow;
        Insert: {
          id?: string;
          species_id: string;
          breed_id?: string | null;
          lifespan?: unknown;
          diet?: unknown;
          exercise_needs?: unknown;
          common_conditions?: unknown;
          vaccination_guidance?: unknown;
          seasonal_considerations?: unknown;
          source?: string | null;
          version?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          species_id?: string;
          breed_id?: string | null;
          lifespan?: unknown;
          diet?: unknown;
          exercise_needs?: unknown;
          common_conditions?: unknown;
          vaccination_guidance?: unknown;
          seasonal_considerations?: unknown;
          source?: string | null;
          version?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'care_guidelines_species_id_fkey';
            columns: ['species_id'];
            referencedRelation: 'species';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'care_guidelines_breed_id_fkey';
            columns: ['breed_id'];
            referencedRelation: 'breeds';
            referencedColumns: ['id'];
          },
        ];
      };
      blog_posts: {
        Row: BlogPostRow;
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          category: string;
          tags?: string[];
          author?: string;
          published_at?: string | null;
          featured_image?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string;
          category?: string;
          tags?: string[];
          author?: string;
          published_at?: string | null;
          featured_image?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      founding_feature_candidates: {
        Row: {
          id: string;
          title: string;
          description: string;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      founding_feature_votes: {
        Row: {
          user_id: string;
          feature_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          feature_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          feature_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sync_profile_subscription_tier: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      expire_founding_trials: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      redeem_promo_code: {
        Args: { p_code: string };
        Returns: Record<string, unknown>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
