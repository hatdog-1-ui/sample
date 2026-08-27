export type LicenseType = "paid" | "free";
export type UserRole = "admin" | "lab_assistant" | "it_team" | "viewer";
export type Responsibility = "lab_assistant" | "it_team" | "no_info";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
        };
        Update: {
          full_name?: string | null;
          role?: UserRole;
        };
      };
      labs: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          hardware_specs: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          hardware_specs?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          hardware_specs?: string | null;
        };
      };
      vendors: {
        Row: {
          id: number;
          name: string;
          address: string | null;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          address?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
        };
        Update: {
          name?: string;
          address?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
        };
      };
      software: {
        Row: {
          id: number;
          name: string;
          license_type: LicenseType;
          download_link: string | null;
          notes: string | null;
          responsibility: Responsibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          license_type?: LicenseType;
          download_link?: string | null;
          notes?: string | null;
          responsibility?: Responsibility;
        };
        Update: {
          name?: string;
          license_type?: LicenseType;
          download_link?: string | null;
          notes?: string | null;
          responsibility?: Responsibility;
        };
      };
      licenses: {
        Row: {
          id: number;
          software_id: number;
          vendor_id: number | null;
          lab_names: string;
          num_licenses: string | null;
          expiration_date: string | null;
          renewal_date: string | null;
          login_details: string | null;
          client_pc_login: string | null;
          rfq_date: string | null;
          mr_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          software_id: number;
          vendor_id?: number | null;
          lab_names: string;
          num_licenses?: string | null;
          expiration_date?: string | null;
          renewal_date?: string | null;
          login_details?: string | null;
          client_pc_login?: string | null;
          rfq_date?: string | null;
          mr_date?: string | null;
          notes?: string | null;
        };
        Update: {
          software_id?: number;
          vendor_id?: number | null;
          lab_names?: string;
          num_licenses?: string | null;
          expiration_date?: string | null;
          renewal_date?: string | null;
          login_details?: string | null;
          client_pc_login?: string | null;
          rfq_date?: string | null;
          mr_date?: string | null;
          notes?: string | null;
        };
      };
      lab_software: {
        Row: {
          id: number;
          lab_id: number;
          software_id: number;
          license_type: LicenseType;
          expiry_date: string | null;
          num_systems: number | null;
          created_at: string;
        };
        Insert: {
          lab_id: number;
          software_id: number;
          license_type?: LicenseType;
          expiry_date?: string | null;
          num_systems?: number | null;
        };
        Update: {
          lab_id?: number;
          software_id?: number;
          license_type?: LicenseType;
          expiry_date?: string | null;
          num_systems?: number | null;
        };
      };
      lab_systems: {
        Row: {
          id: number;
          lab_id: number;
          system_name: string;
          hardware_specs: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          lab_id: number;
          system_name: string;
          hardware_specs?: string | null;
        };
        Update: {
          lab_id?: number;
          system_name?: string;
          hardware_specs?: string | null;
        };
      };
    };
  };
}
