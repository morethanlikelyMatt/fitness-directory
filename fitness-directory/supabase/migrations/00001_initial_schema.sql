-- Fitness Directory Initial Schema
-- Based on design document: docs/plans/2026-01-09-fitness-directory-design.md

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'premium');

CREATE TYPE gym_status AS ENUM ('pending', 'verified', 'claimed', 'suspended');

CREATE TYPE price_range AS ENUM ('$', '$$', '$$$', '$$$$');

CREATE TYPE gym_type AS ENUM (
  'commercial',
  'boutique',
  'crossfit',
  'powerlifting',
  '24hour',
  'womens',
  'rehab',
  'university',
  'hotel',
  'community'
);

CREATE TYPE attribute_category AS ENUM (
  'equipment',
  'amenity',
  'class',
  'specialty',
  'recovery'
);

CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');

CREATE TYPE submission_type AS ENUM ('claim', 'new_submission', 'suggestion');

CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_info');

CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');

CREATE TYPE premium_field_type AS ENUM ('detail', 'attribute');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  favorite_centers UUID[] DEFAULT '{}',
  alert_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fitness Centers (core listing data)
CREATE TABLE fitness_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours JSONB, -- { "monday": { "open": "06:00", "close": "22:00" }, ... }
  price_range price_range,
  gym_type gym_type NOT NULL,
  status gym_status NOT NULL DEFAULT 'pending',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fitness Center Details (1:1 extension for rich content)
CREATE TABLE fitness_center_details (
  fitness_center_id UUID PRIMARY KEY REFERENCES fitness_centers(id) ON DELETE CASCADE,
  photos TEXT[] DEFAULT '{}', -- Array of storage URLs
  virtual_tour_url TEXT,
  class_schedule JSONB, -- Structured class schedule data
  detailed_equipment_list JSONB, -- Detailed equipment with quantities/specs
  staff_bios JSONB, -- Staff information
  contract_terms TEXT,
  guest_policy TEXT,
  childcare_details JSONB,
  recovery_services JSONB, -- Sauna, massage, cryotherapy, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attributes lookup table
CREATE TABLE attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category attribute_category NOT NULL,
  icon TEXT, -- Icon identifier or URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fitness Center Attributes (many-to-many)
CREATE TABLE fitness_center_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fitness_center_id UUID NOT NULL REFERENCES fitness_centers(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
  value TEXT, -- Optional value (e.g., "Olympic" for barbells)
  quantity INTEGER, -- Optional quantity (e.g., 10 squat racks)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fitness_center_id, attribute_id)
);

-- Premium Config (controls which fields require paid subscription)
CREATE TABLE premium_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL UNIQUE,
  field_type premium_field_type NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions (Stripe integration)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fitness_center_id UUID NOT NULL REFERENCES fitness_centers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fitness_center_id) -- One subscription per fitness center
);

-- Submissions (claims, new submissions, suggestions)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fitness_center_id UUID REFERENCES fitness_centers(id) ON DELETE SET NULL, -- NULL for new submissions
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type submission_type NOT NULL,
  is_owner BOOLEAN NOT NULL DEFAULT false,
  submitted_data JSONB NOT NULL DEFAULT '{}',
  verification_docs TEXT[] DEFAULT '{}', -- Array of storage URLs
  status submission_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fitness centers indexes
CREATE INDEX idx_fitness_centers_slug ON fitness_centers(slug);
CREATE INDEX idx_fitness_centers_city ON fitness_centers(city);
CREATE INDEX idx_fitness_centers_country ON fitness_centers(country);
CREATE INDEX idx_fitness_centers_gym_type ON fitness_centers(gym_type);
CREATE INDEX idx_fitness_centers_status ON fitness_centers(status);
CREATE INDEX idx_fitness_centers_owner_id ON fitness_centers(owner_id);
CREATE INDEX idx_fitness_centers_location ON fitness_centers(latitude, longitude);
CREATE INDEX idx_fitness_centers_subscription_tier ON fitness_centers(subscription_tier);

-- Attributes indexes
CREATE INDEX idx_attributes_category ON attributes(category);
CREATE INDEX idx_attributes_slug ON attributes(slug);

-- Fitness center attributes indexes
CREATE INDEX idx_fc_attributes_fitness_center ON fitness_center_attributes(fitness_center_id);
CREATE INDEX idx_fc_attributes_attribute ON fitness_center_attributes(attribute_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_fitness_center ON subscriptions(fitness_center_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Submissions indexes
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_fitness_center ON submissions(fitness_center_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_type ON submissions(type);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, city TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from name and city
  base_slug := lower(regexp_replace(name || '-' || city, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM fitness_centers WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_centers_updated_at
  BEFORE UPDATE ON fitness_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_center_details_updated_at
  BEFORE UPDATE ON fitness_center_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_config_updated_at
  BEFORE UPDATE ON premium_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_center_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_center_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Fitness centers policies (public read, owner/admin write)
CREATE POLICY "Anyone can view verified fitness centers"
  ON fitness_centers FOR SELECT
  USING (status IN ('verified', 'claimed'));

CREATE POLICY "Owners can view their own pending centers"
  ON fitness_centers FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can update their own centers"
  ON fitness_centers FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can do everything with fitness centers"
  ON fitness_centers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fitness center details policies
CREATE POLICY "Anyone can view details of verified centers"
  ON fitness_center_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fitness_centers fc
      WHERE fc.id = fitness_center_id
      AND fc.status IN ('verified', 'claimed')
    )
  );

CREATE POLICY "Owners can manage their center details"
  ON fitness_center_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fitness_centers fc
      WHERE fc.id = fitness_center_id
      AND fc.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all center details"
  ON fitness_center_details FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Attributes policies (public read, admin write)
CREATE POLICY "Anyone can view attributes"
  ON attributes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage attributes"
  ON attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fitness center attributes policies
CREATE POLICY "Anyone can view center attributes"
  ON fitness_center_attributes FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their center attributes"
  ON fitness_center_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM fitness_centers fc
      WHERE fc.id = fitness_center_id
      AND fc.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all center attributes"
  ON fitness_center_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Premium config policies (admin only)
CREATE POLICY "Anyone can view premium config"
  ON premium_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage premium config"
  ON premium_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
  ON submissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pending submissions"
  ON submissions FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all submissions"
  ON submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SEED DATA: Default Attributes
-- ============================================================================

INSERT INTO attributes (name, slug, category, icon) VALUES
  -- Equipment
  ('Squat Racks', 'squat-racks', 'equipment', 'dumbbell'),
  ('Power Racks', 'power-racks', 'equipment', 'dumbbell'),
  ('Bench Press', 'bench-press', 'equipment', 'dumbbell'),
  ('Deadlift Platforms', 'deadlift-platforms', 'equipment', 'dumbbell'),
  ('Olympic Barbells', 'olympic-barbells', 'equipment', 'dumbbell'),
  ('Dumbbells', 'dumbbells', 'equipment', 'dumbbell'),
  ('Kettlebells', 'kettlebells', 'equipment', 'dumbbell'),
  ('Cable Machines', 'cable-machines', 'equipment', 'dumbbell'),
  ('Smith Machines', 'smith-machines', 'equipment', 'dumbbell'),
  ('Leg Press', 'leg-press', 'equipment', 'dumbbell'),
  ('Hack Squat', 'hack-squat', 'equipment', 'dumbbell'),
  ('Treadmills', 'treadmills', 'equipment', 'heart'),
  ('Ellipticals', 'ellipticals', 'equipment', 'heart'),
  ('Rowing Machines', 'rowing-machines', 'equipment', 'heart'),
  ('Stationary Bikes', 'stationary-bikes', 'equipment', 'heart'),
  ('Assault Bikes', 'assault-bikes', 'equipment', 'heart'),
  ('Stair Climbers', 'stair-climbers', 'equipment', 'heart'),
  ('Battle Ropes', 'battle-ropes', 'equipment', 'zap'),
  ('Plyo Boxes', 'plyo-boxes', 'equipment', 'zap'),
  ('TRX/Suspension', 'trx-suspension', 'equipment', 'zap'),

  -- Amenities
  ('Locker Rooms', 'locker-rooms', 'amenity', 'lock'),
  ('Showers', 'showers', 'amenity', 'droplet'),
  ('Towel Service', 'towel-service', 'amenity', 'wind'),
  ('WiFi', 'wifi', 'amenity', 'wifi'),
  ('Parking', 'parking', 'amenity', 'car'),
  ('Pro Shop', 'pro-shop', 'amenity', 'shopping-bag'),
  ('Juice Bar', 'juice-bar', 'amenity', 'coffee'),
  ('Childcare', 'childcare', 'amenity', 'baby'),
  ('Personal Training', 'personal-training', 'amenity', 'user'),
  ('Group Classes', 'group-classes', 'amenity', 'users'),

  -- Classes
  ('Yoga', 'yoga', 'class', 'sun'),
  ('Pilates', 'pilates', 'class', 'target'),
  ('Spin/Cycling', 'spin-cycling', 'class', 'bike'),
  ('HIIT', 'hiit', 'class', 'zap'),
  ('Boxing', 'boxing', 'class', 'target'),
  ('Kickboxing', 'kickboxing', 'class', 'target'),
  ('Zumba', 'zumba', 'class', 'music'),
  ('CrossFit Classes', 'crossfit-classes', 'class', 'activity'),
  ('Swimming', 'swimming', 'class', 'droplet'),
  ('Martial Arts', 'martial-arts', 'class', 'shield'),

  -- Specialties
  ('Powerlifting Focused', 'powerlifting-focused', 'specialty', 'trophy'),
  ('Bodybuilding Focused', 'bodybuilding-focused', 'specialty', 'trophy'),
  ('Olympic Lifting', 'olympic-lifting', 'specialty', 'trophy'),
  ('Strongman Equipment', 'strongman-equipment', 'specialty', 'trophy'),
  ('Sport-Specific Training', 'sport-specific-training', 'specialty', 'target'),
  ('Senior Programs', 'senior-programs', 'specialty', 'heart'),
  ('Youth Programs', 'youth-programs', 'specialty', 'star'),
  ('Rehabilitation', 'rehabilitation', 'specialty', 'plus'),

  -- Recovery
  ('Sauna', 'sauna', 'recovery', 'thermometer'),
  ('Steam Room', 'steam-room', 'recovery', 'cloud'),
  ('Hot Tub', 'hot-tub', 'recovery', 'droplet'),
  ('Cold Plunge', 'cold-plunge', 'recovery', 'snowflake'),
  ('Massage Services', 'massage-services', 'recovery', 'hand'),
  ('Cryotherapy', 'cryotherapy', 'recovery', 'snowflake'),
  ('Stretching Area', 'stretching-area', 'recovery', 'move'),
  ('Foam Rollers', 'foam-rollers', 'recovery', 'circle');

-- ============================================================================
-- SEED DATA: Premium Config Defaults
-- ============================================================================

INSERT INTO premium_config (field_name, field_type, is_premium) VALUES
  -- Free fields (basic listing info)
  ('name', 'detail', false),
  ('description', 'detail', false),
  ('address', 'detail', false),
  ('hours', 'detail', false),
  ('phone', 'detail', false),
  ('website', 'detail', false),
  ('gym_type', 'detail', false),
  ('price_range', 'detail', false),

  -- Premium detail fields
  ('photos', 'detail', true),
  ('virtual_tour_url', 'detail', true),
  ('class_schedule', 'detail', true),
  ('detailed_equipment_list', 'detail', true),
  ('staff_bios', 'detail', true),
  ('contract_terms', 'detail', true),
  ('guest_policy', 'detail', true),
  ('childcare_details', 'detail', true),
  ('recovery_services', 'detail', true),

  -- Attribute display options
  ('attribute_quantity', 'attribute', true), -- Show quantities (e.g., "10 squat racks")
  ('attribute_value', 'attribute', true); -- Show values (e.g., "Olympic barbells")
