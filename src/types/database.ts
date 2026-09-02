export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'tenant' | 'owner' | 'admin';
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'rented' | 'expired';
export type PropertyType = 'apartment' | 'room' | 'sublet' | 'mess' | 'hostel' | 'seat';
export type TargetAudience = 'family' | 'bachelor' | 'student' | 'male' | 'female' | 'mixed';
export type AmenityCategory = 'core' | 'comfort' | 'security' | 'meal_service';
export type ReportReason = 'fake_listing' | 'wrong_phone' | 'already_rented' | 'scam' | 'incorrect_info' | 'inappropriate_content';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'resolved';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          name: string;
          email: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_verified: boolean;
          whatsapp_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name: string;
          email?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_verified?: boolean;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string;
          email?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_verified?: boolean;
          whatsapp_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedSchema: 'auth';
            referencedColumns: ['id'];
          }
        ];
      };
      areas: {
        Row: {
          id: string;
          name_en: string;
          name_bn: string;
          slug: string;
          description_bn: string | null;
          description_en: string | null;
          is_popular: boolean;
          listing_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name_en: string;
          name_bn: string;
          slug: string;
          description_bn?: string | null;
          description_en?: string | null;
          is_popular?: boolean;
          listing_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_bn?: string;
          slug?: string;
          description_bn?: string | null;
          description_en?: string | null;
          is_popular?: boolean;
          listing_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      amenities: {
        Row: {
          id: string;
          name_en: string;
          name_bn: string;
          icon_name: string;
          category: AmenityCategory;
          created_at: string;
        };
        Insert: {
          id: string;
          name_en: string;
          name_bn: string;
          icon_name: string;
          category?: AmenityCategory;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_bn?: string;
          icon_name?: string;
          category?: AmenityCategory;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          title_bn: string;
          title_en: string | null;
          slug: string;
          description_bn: string;
          description_en: string | null;
          property_type: PropertyType;
          audience: TargetAudience;
          status: ListingStatus;
          rent_monthly: number;
          security_deposit: number | null;
          is_negotiable: boolean;
          service_charge: number | null;
          gas_bill_included: boolean;
          electricity_bill_included: boolean;
          water_bill_included: boolean;
          bedrooms: number | null;
          bathrooms: number | null;
          balconies: number | null;
          floor_number: number | null;
          total_floors: number | null;
          area_sqft: number | null;
          seat_count: number | null;
          area_id: string;
          address_street_bn: string;
          address_street_en: string | null;
          landmark_bn: string | null;
          landmark_en: string | null;
          latitude: number | null;
          longitude: number | null;
          contact_name: string;
          contact_phone: string;
          contact_whatsapp: string | null;
          hide_exact_phone: boolean;
          is_verified: boolean;
          is_featured: boolean;
          views_count: number;
          available_from: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title_bn: string;
          title_en?: string | null;
          slug: string;
          description_bn: string;
          description_en?: string | null;
          property_type: PropertyType;
          audience: TargetAudience;
          status?: ListingStatus;
          rent_monthly: number;
          security_deposit?: number | null;
          is_negotiable?: boolean;
          service_charge?: number | null;
          gas_bill_included?: boolean;
          electricity_bill_included?: boolean;
          water_bill_included?: boolean;
          bedrooms?: number | null;
          bathrooms?: number | null;
          balconies?: number | null;
          floor_number?: number | null;
          total_floors?: number | null;
          area_sqft?: number | null;
          seat_count?: number | null;
          area_id: string;
          address_street_bn: string;
          address_street_en?: string | null;
          landmark_bn?: string | null;
          landmark_en?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          contact_name: string;
          contact_phone: string;
          contact_whatsapp?: string | null;
          hide_exact_phone?: boolean;
          is_verified?: boolean;
          is_featured?: boolean;
          views_count?: number;
          available_from: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title_bn?: string;
          title_en?: string | null;
          slug?: string;
          description_bn?: string;
          description_en?: string | null;
          property_type?: PropertyType;
          audience?: TargetAudience;
          status?: ListingStatus;
          rent_monthly?: number;
          security_deposit?: number | null;
          is_negotiable?: boolean;
          service_charge?: number | null;
          gas_bill_included?: boolean;
          electricity_bill_included?: boolean;
          water_bill_included?: boolean;
          bedrooms?: number | null;
          bathrooms?: number | null;
          balconies?: number | null;
          floor_number?: number | null;
          total_floors?: number | null;
          area_sqft?: number | null;
          seat_count?: number | null;
          area_id?: string;
          address_street_bn?: string;
          address_street_en?: string | null;
          landmark_bn?: string | null;
          landmark_en?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          contact_name?: string;
          contact_phone?: string;
          contact_whatsapp?: string | null;
          hide_exact_phone?: boolean;
          is_verified?: boolean;
          is_featured?: boolean;
          views_count?: number;
          available_from?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_area_id_fkey';
            columns: ['area_id'];
            isOneToOne: false;
            referencedRelation: 'areas';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          storage_path: string;
          is_primary: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          storage_path: string;
          is_primary?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          storage_path?: string;
          is_primary?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_images_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
      listing_amenities: {
        Row: {
          listing_id: string;
          amenity_id: string;
          created_at: string;
        };
        Insert: {
          listing_id: string;
          amenity_id: string;
          created_at?: string;
        };
        Update: {
          listing_id?: string;
          amenity_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_amenities_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listing_amenities_amenity_id_fkey';
            columns: ['amenity_id'];
            isOneToOne: false;
            referencedRelation: 'amenities';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_favorites_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
      listing_reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_id: string | null;
          reason: ReportReason;
          comment: string | null;
          status: ReportStatus;
          moderator_notes: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reporter_id?: string | null;
          reason: ReportReason;
          comment?: string | null;
          status?: ReportStatus;
          moderator_notes?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          reporter_id?: string | null;
          reason?: ReportReason;
          comment?: string | null;
          status?: ReportStatus;
          moderator_notes?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_reports_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listing_reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          filters: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          filters?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          filters?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_searches_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedSchema: 'public';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      listing_status: ListingStatus;
      property_type: PropertyType;
      target_audience: TargetAudience;
      amenity_category: AmenityCategory;
      report_reason: ReportReason;
      report_status: ReportStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
