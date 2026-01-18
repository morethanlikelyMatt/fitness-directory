#!/bin/bash

# Seed script for Fitness Directory
# Usage: ./supabase/seeds/seed.sh
#
# Requires either:
# - SUPABASE_DB_URL environment variable (connection string)
# - Or running with supabase CLI: supabase db reset (runs migrations + seeds)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fitness Directory - Database Seeding${NC}"
echo "======================================"

# Check for database URL
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo ""
    echo "Set it with your Supabase connection string:"
    echo "  export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "Or use Supabase CLI to run seeds automatically:"
    echo "  supabase db reset"
    exit 1
fi

# Seed files in order
SEED_FILES=(
    "01_attributes.sql"
    "02_fitness_centers.sql"
    "03_fitness_center_attributes.sql"
)

echo ""
echo "Running seed files..."
echo ""

for file in "${SEED_FILES[@]}"; do
    filepath="$SCRIPT_DIR/$file"

    if [ ! -f "$filepath" ]; then
        echo -e "${RED}Error: Seed file not found: $file${NC}"
        exit 1
    fi

    echo -n "  Seeding $file... "

    if psql "$SUPABASE_DB_URL" -f "$filepath" -q 2>/dev/null; then
        echo -e "${GREEN}done${NC}"
    else
        echo -e "${RED}failed${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}All seeds completed successfully!${NC}"
echo ""
echo "Seeded data:"
echo "  - Attributes (equipment, amenities, classes, specialties, recovery)"
echo "  - Fitness centers (NYC, LA, Chicago, Austin, Miami)"
echo "  - Fitness center attribute mappings"
