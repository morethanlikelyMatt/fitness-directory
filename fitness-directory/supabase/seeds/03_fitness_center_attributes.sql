-- Seed data for fitness_center_attributes
-- Links gyms to their equipment/amenities

-- Helper to insert attributes for a gym by slug
-- Iron Haven Gym (powerlifting)
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'iron-haven-gym-nyc' AND a.slug IN (
  'squat-racks', 'power-racks', 'deadlift-platforms', 'bench-press-stations',
  'dumbbells', 'barbells', 'olympic-barbells', 'weight-plates', 'bumper-plates',
  'cable-machines', 'leg-press-machines', 'locker-rooms', 'showers', 'air-conditioning',
  'wifi', 'personal-training-available', 'powerlifting', 'bodybuilding', 'competition-prep'
)
ON CONFLICT DO NOTHING;

-- CrossFit SoHo
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'crossfit-soho-nyc' AND a.slug IN (
  'squat-racks', 'olympic-lifting-platforms', 'pull-up-bars', 'rowing-machines',
  'assault-bikes', 'kettlebells', 'barbells', 'bumper-plates', 'plyo-boxes',
  'ghd-machines', 'climbing-ropes', 'battle-ropes', 'locker-rooms', 'showers',
  'crossfit-classes', 'olympic-lifting-classes', 'hiit', 'crossfit', 'functional-fitness'
)
ON CONFLICT DO NOTHING;

-- FitLife 24/7 Brooklyn
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'fitlife-247-brooklyn' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'dumbbells', 'barbells',
  'cable-machines', 'smith-machines', 'leg-press-machines', 'locker-rooms',
  'showers', '24-7-access', 'wifi', 'air-conditioning', 'no-contract-required'
)
ON CONFLICT DO NOTHING;

-- Zen Yoga Studio
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'zen-yoga-studio-nyc' AND a.slug IN (
  'yoga', 'hot-yoga', 'meditation', 'stretching-classes', 'locker-rooms',
  'showers', 'towel-service', 'air-conditioning', 'wifi'
)
ON CONFLICT DO NOTHING;

-- Muscle Beach Fitness
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'muscle-beach-fitness-la' AND a.slug IN (
  'dumbbells', 'barbells', 'squat-racks', 'bench-press-stations', 'cable-machines',
  'pull-up-bars', 'dip-stations', 'outdoor-area', 'bodybuilding', 'functional-fitness'
)
ON CONFLICT DO NOTHING;

-- West Hollywood Strength
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'west-hollywood-strength-la' AND a.slug IN (
  'squat-racks', 'power-racks', 'dumbbells', 'barbells', 'cable-machines',
  'treadmills', 'ellipticals', 'locker-rooms', 'showers', 'towel-service',
  'sauna', 'personal-training-available', 'valet-parking', 'wifi', 'air-conditioning',
  'bodybuilding', 'weight-loss', 'sports-performance'
)
ON CONFLICT DO NOTHING;

-- CrossFit Santa Monica
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'crossfit-santa-monica-la' AND a.slug IN (
  'squat-racks', 'olympic-lifting-platforms', 'pull-up-bars', 'rowing-machines',
  'assault-bikes', 'kettlebells', 'barbells', 'bumper-plates', 'outdoor-area',
  'locker-rooms', 'showers', 'free-parking', 'crossfit-classes', 'crossfit'
)
ON CONFLICT DO NOTHING;

-- LA Fitness Downtown
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'la-fitness-downtown-la' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'rowing-machines', 'squat-racks',
  'dumbbells', 'barbells', 'cable-machines', 'leg-press-machines', 'swimming-pool',
  'basketball-court', 'locker-rooms', 'showers', 'sauna', 'group-classes-included',
  'personal-training-available', 'yoga', 'spin-cycling', 'hiit'
)
ON CONFLICT DO NOTHING;

-- Chicago Barbell Club
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'chicago-barbell-club' AND a.slug IN (
  'squat-racks', 'power-racks', 'deadlift-platforms', 'bench-press-stations',
  'dumbbells', 'barbells', 'olympic-barbells', 'weight-plates', 'bumper-plates',
  'locker-rooms', 'showers', 'powerlifting', 'competition-prep'
)
ON CONFLICT DO NOTHING;

-- Lakeview CrossFit
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'lakeview-crossfit-chicago' AND a.slug IN (
  'squat-racks', 'olympic-lifting-platforms', 'pull-up-bars', 'rowing-machines',
  'assault-bikes', 'kettlebells', 'barbells', 'bumper-plates', 'plyo-boxes',
  'locker-rooms', 'showers', 'crossfit-classes', 'crossfit', 'functional-fitness'
)
ON CONFLICT DO NOTHING;

-- XSport Fitness Loop
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'xsport-fitness-loop-chicago' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'squat-racks', 'dumbbells',
  'barbells', 'cable-machines', 'smith-machines', 'locker-rooms', 'showers',
  '24-7-access', 'wifi', 'air-conditioning', 'group-classes-included'
)
ON CONFLICT DO NOTHING;

-- Women's Fitness Chicago
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'womens-fitness-chicago' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'dumbbells', 'cable-machines',
  'locker-rooms', 'showers', 'towel-service', 'childcare', 'personal-training-available',
  'yoga', 'pilates', 'spin-cycling', 'barre', 'womens-only', 'weight-loss'
)
ON CONFLICT DO NOTHING;

-- Austin Barbell
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'austin-barbell' AND a.slug IN (
  'squat-racks', 'power-racks', 'deadlift-platforms', 'bench-press-stations',
  'dumbbells', 'barbells', 'olympic-barbells', 'weight-plates', 'bumper-plates',
  'locker-rooms', 'showers', 'free-parking', 'air-conditioning',
  'powerlifting', 'olympic-weightlifting', 'competition-prep'
)
ON CONFLICT DO NOTHING;

-- CrossFit Central Austin
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'crossfit-central-austin' AND a.slug IN (
  'squat-racks', 'olympic-lifting-platforms', 'pull-up-bars', 'rowing-machines',
  'assault-bikes', 'ski-ergs', 'kettlebells', 'barbells', 'bumper-plates',
  'plyo-boxes', 'ghd-machines', 'locker-rooms', 'showers', 'free-parking',
  'crossfit-classes', 'olympic-lifting-classes', 'crossfit', 'nutrition-coaching'
)
ON CONFLICT DO NOTHING;

-- Castle Hill Fitness Austin
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'castle-hill-fitness-austin' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'squat-racks', 'dumbbells',
  'barbells', 'cable-machines', 'swimming-pool', 'locker-rooms', 'showers',
  'towel-service', 'sauna', 'steam-room', 'juice-bar', 'personal-training-available',
  'yoga', 'pilates', 'spin-cycling', 'massage-therapy', 'weight-loss'
)
ON CONFLICT DO NOTHING;

-- Planet Fitness South Austin
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'planet-fitness-south-austin' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'dumbbells', 'cable-machines',
  'smith-machines', 'locker-rooms', 'showers', 'free-parking', 'wifi',
  'air-conditioning', 'no-contract-required', 'day-passes-available'
)
ON CONFLICT DO NOTHING;

-- Iron Paradise Miami
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'iron-paradise-miami' AND a.slug IN (
  'squat-racks', 'power-racks', 'dumbbells', 'barbells', 'cable-machines',
  'leg-press-machines', 'hack-squat-machines', 'locker-rooms', 'showers',
  'air-conditioning', 'bodybuilding', 'competition-prep'
)
ON CONFLICT DO NOTHING;

-- CrossFit Wynwood
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'crossfit-wynwood-miami' AND a.slug IN (
  'squat-racks', 'olympic-lifting-platforms', 'pull-up-bars', 'rowing-machines',
  'assault-bikes', 'kettlebells', 'barbells', 'bumper-plates', 'outdoor-area',
  'locker-rooms', 'showers', 'free-parking', 'crossfit-classes', 'crossfit'
)
ON CONFLICT DO NOTHING;

-- Equinox Brickell
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'equinox-brickell-miami' AND a.slug IN (
  'treadmills', 'ellipticals', 'stationary-bikes', 'squat-racks', 'dumbbells',
  'barbells', 'cable-machines', 'locker-rooms', 'showers', 'towel-service',
  'sauna', 'steam-room', 'juice-bar', 'spa', 'personal-training-available',
  'yoga', 'pilates', 'spin-cycling', 'hiit', 'massage-therapy'
)
ON CONFLICT DO NOTHING;

-- UFC Gym Doral
INSERT INTO fitness_center_attributes (fitness_center_id, attribute_id)
SELECT fc.id, a.id FROM fitness_centers fc, attributes a
WHERE fc.slug = 'ufc-gym-doral-miami' AND a.slug IN (
  'treadmills', 'ellipticals', 'squat-racks', 'dumbbells', 'barbells',
  'cable-machines', 'pull-up-bars', 'locker-rooms', 'showers', 'free-parking',
  'boxing', 'kickboxing', 'martial-arts', 'mma', 'brazilian-jiu-jitsu',
  'hiit', 'strength-training-classes'
)
ON CONFLICT DO NOTHING;
