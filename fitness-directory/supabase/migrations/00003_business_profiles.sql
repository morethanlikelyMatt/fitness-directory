-- Business Profiles Migration
-- Separates business-specific data from personal user accounts
-- Allows gym owners to manage multiple gyms under one business profile

-- ============================================================================
-- TABLES
-- ============================================================================

-- Business Profiles table
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_country TEXT,
  business_postal_code TEXT,
  tax_id TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add business_profile_id to fitness_centers
ALTER TABLE fitness_centers
ADD COLUMN business_profile_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_business_profiles_user ON business_profiles(user_id);
CREATE INDEX idx_fitness_centers_business_profile ON fitness_centers(business_profile_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at trigger for business_profiles
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own business profiles
CREATE POLICY "Users can view their own business profiles"
  ON business_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Users can create business profiles for themselves
CREATE POLICY "Users can create their own business profiles"
  ON business_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own business profiles
CREATE POLICY "Users can update their own business profiles"
  ON business_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own business profiles
CREATE POLICY "Users can delete their own business profiles"
  ON business_profiles FOR DELETE
  USING (user_id = auth.uid());

-- Admins can do everything with business profiles
CREATE POLICY "Admins can manage all business profiles"
  ON business_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- UPDATE FITNESS CENTERS POLICIES
-- ============================================================================

-- Allow owners to view/update centers linked to their business profile
CREATE POLICY "Business owners can view centers linked to their profile"
  ON fitness_centers FOR SELECT
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update centers linked to their profile"
  ON fitness_centers FOR UPDATE
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );
