-- ============================================================
-- Lab Inventory & Software License Tracking System
-- Supabase (PostgreSQL) Schema
-- ============================================================

-- 1. Computers table
CREATE TABLE computers (
  computer_id   SERIAL PRIMARY KEY,
  computer_name TEXT NOT NULL,
  location      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive', 'Maintenance', 'Retired')),
  os_version    TEXT,
  specs         TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Software Licenses table
CREATE TABLE software_licenses (
  license_id      SERIAL PRIMARY KEY,
  software_name   TEXT NOT NULL,
  license_type    TEXT NOT NULL DEFAULT 'Paid'
                  CHECK (license_type IN ('Paid', 'Free', 'Trial', 'Educational')),
  total_seats     INTEGER,
  expiration_date DATE,
  vendor          TEXT,
  contact_details TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Installations junction table
CREATE TABLE installations (
  install_id   SERIAL PRIMARY KEY,
  computer_id  INTEGER NOT NULL REFERENCES computers(computer_id) ON DELETE CASCADE,
  license_id   INTEGER NOT NULL REFERENCES software_licenses(license_id) ON DELETE CASCADE,
  install_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (computer_id, license_id)
);

-- Indexes for common queries
CREATE INDEX idx_computers_location ON computers(location);
CREATE INDEX idx_computers_status ON computers(status);
CREATE INDEX idx_installations_computer ON installations(computer_id);
CREATE INDEX idx_installations_license ON installations(license_id);
CREATE INDEX idx_licenses_expiration ON software_licenses(expiration_date);

-- View: remaining seats per license
CREATE OR REPLACE VIEW license_seat_usage AS
SELECT
  sl.license_id,
  sl.software_name,
  sl.license_type,
  sl.total_seats,
  sl.expiration_date,
  sl.vendor,
  COUNT(i.install_id)::INTEGER AS used_seats,
  CASE
    WHEN sl.total_seats IS NULL THEN NULL
    ELSE sl.total_seats - COUNT(i.install_id)::INTEGER
  END AS remaining_seats
FROM software_licenses sl
LEFT JOIN installations i ON sl.license_id = i.license_id
GROUP BY sl.license_id, sl.software_name, sl.license_type,
         sl.total_seats, sl.expiration_date, sl.vendor;

-- Enable Row Level Security (open read/write for authenticated users)
ALTER TABLE computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON computers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON software_licenses FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON installations FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON computers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON software_licenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON installations FOR ALL TO authenticated USING (true) WITH CHECK (true);
