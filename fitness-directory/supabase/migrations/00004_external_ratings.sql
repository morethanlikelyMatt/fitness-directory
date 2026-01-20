-- Add external rating URLs to fitness_center_details table
ALTER TABLE fitness_center_details
ADD COLUMN yelp_url TEXT,
ADD COLUMN google_maps_url TEXT;
