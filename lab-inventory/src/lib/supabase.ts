import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

export type Computer = {
  computer_id: number
  computer_name: string
  location: string
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired'
  os_version: string | null
  specs: string | null
  notes: string | null
  created_at: string
}

export type SoftwareLicense = {
  license_id: number
  software_name: string
  license_type: 'Paid' | 'Free' | 'Trial' | 'Educational'
  total_seats: number | null
  expiration_date: string | null
  vendor: string | null
  contact_details: string | null
  notes: string | null
  created_at: string
}

export type Installation = {
  install_id: number
  computer_id: number
  license_id: number
  install_date: string
  notes: string | null
  created_at: string
  computers?: Computer
  software_licenses?: SoftwareLicense
}

export type LicenseSeatUsage = {
  license_id: number
  software_name: string
  license_type: string
  total_seats: number | null
  expiration_date: string | null
  vendor: string | null
  used_seats: number
  remaining_seats: number | null
}
