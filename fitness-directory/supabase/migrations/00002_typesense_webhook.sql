-- Migration: Set up database webhook for Typesense sync
-- This triggers the sync-typesense Edge Function on fitness_centers changes

-- Note: Database webhooks are configured via Supabase Dashboard, not SQL
-- This migration serves as documentation for the webhook configuration

/*
WEBHOOK CONFIGURATION (set up in Supabase Dashboard):

1. Go to Database > Webhooks
2. Create a new webhook with these settings:

   Name: sync-typesense-on-fitness-centers-change

   Table: fitness_centers

   Events:
     ✓ Insert
     ✓ Update
     ✓ Delete

   Type: Supabase Edge Function

   Edge Function: sync-typesense

   HTTP Headers:
     Content-Type: application/json

3. Deploy the Edge Function first:
   supabase functions deploy sync-typesense

4. Set Edge Function secrets:
   supabase secrets set TYPESENSE_HOST=your-typesense-host
   supabase secrets set TYPESENSE_ADMIN_API_KEY=your-admin-key
   supabase secrets set TYPESENSE_PORT=443
   supabase secrets set TYPESENSE_PROTOCOL=https
*/

-- Create a function to notify on fitness_center_attributes changes
-- Since attribute changes affect the search index, we need to trigger
-- a re-index of the parent fitness_center

CREATE OR REPLACE FUNCTION notify_fitness_center_attribute_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Touch the parent fitness_center to trigger the webhook
  IF TG_OP = 'DELETE' THEN
    UPDATE fitness_centers
    SET updated_at = NOW()
    WHERE id = OLD.fitness_center_id;
    RETURN OLD;
  ELSE
    UPDATE fitness_centers
    SET updated_at = NOW()
    WHERE id = NEW.fitness_center_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update fitness_center when attributes change
CREATE TRIGGER on_fitness_center_attribute_change
  AFTER INSERT OR UPDATE OR DELETE ON fitness_center_attributes
  FOR EACH ROW EXECUTE FUNCTION notify_fitness_center_attribute_change();

-- Index for faster attribute lookups during sync
CREATE INDEX IF NOT EXISTS idx_fc_attributes_lookup
  ON fitness_center_attributes(fitness_center_id, attribute_id);
