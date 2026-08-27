-- Amity University Dubai - Lab Software Inventory System
-- Database Schema for Supabase (PostgreSQL)

-- Enable Row Level Security
-- Run this in Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE license_type AS ENUM ('paid', 'free');
CREATE TYPE user_role AS ENUM ('admin', 'lab_assistant', 'it_team', 'viewer');
CREATE TYPE responsibility AS ENUM ('lab_assistant', 'it_team', 'no_info');

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LABS
-- ============================================
CREATE TABLE labs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  hardware_specs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- VENDORS
-- ============================================
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SOFTWARE (master catalog)
-- ============================================
CREATE TABLE software (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  license_type license_type NOT NULL DEFAULT 'free',
  download_link TEXT,
  notes TEXT,
  responsibility responsibility NOT NULL DEFAULT 'lab_assistant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LICENSES (tracks paid software licensing)
-- ============================================
CREATE TABLE licenses (
  id SERIAL PRIMARY KEY,
  software_id INT NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
  lab_names TEXT NOT NULL,
  num_licenses TEXT,
  expiration_date DATE,
  renewal_date DATE,
  login_details TEXT,
  client_pc_login TEXT,
  rfq_date TEXT,
  mr_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LAB_SOFTWARE (which software is in which lab)
-- ============================================
CREATE TABLE lab_software (
  id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  software_id INT NOT NULL REFERENCES software(id) ON DELETE CASCADE,
  license_type license_type NOT NULL DEFAULT 'free',
  expiry_date DATE,
  num_systems INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lab_id, software_id)
);

-- ============================================
-- LAB_SYSTEMS (individual computers per lab)
-- ============================================
CREATE TABLE lab_systems (
  id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  system_name TEXT NOT NULL,
  hardware_specs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_software ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_systems ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Labs: all authenticated can read, admin/lab_assistant can modify
CREATE POLICY "Labs are viewable by authenticated users"
  ON labs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage labs"
  ON labs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lab_assistant')));

-- Vendors: all authenticated can read, admin can modify
CREATE POLICY "Vendors are viewable by authenticated users"
  ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage vendors"
  ON vendors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Software: all authenticated can read, admin/lab_assistant can modify
CREATE POLICY "Software is viewable by authenticated users"
  ON software FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage software"
  ON software FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lab_assistant')));

-- Licenses: viewable by admin/lab_assistant/it_team (contains sensitive data)
CREATE POLICY "Licenses viewable by authorized roles"
  ON licenses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lab_assistant', 'it_team')));
CREATE POLICY "Admins can manage licenses"
  ON licenses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Lab Software: all authenticated can read
CREATE POLICY "Lab software is viewable by authenticated users"
  ON lab_software FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage lab software"
  ON lab_software FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lab_assistant')));

-- Lab Systems: all authenticated can read
CREATE POLICY "Lab systems are viewable by authenticated users"
  ON lab_systems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage lab systems"
  ON lab_systems FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'lab_assistant')));

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON labs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON software FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lab_systems_updated_at BEFORE UPDATE ON lab_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE software;
ALTER PUBLICATION supabase_realtime ADD TABLE licenses;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_software;
ALTER PUBLICATION supabase_realtime ADD TABLE labs;
