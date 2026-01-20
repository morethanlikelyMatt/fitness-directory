#!/bin/bash
# Helper script to start/restart the dev server
# Run from project root: ./scripts/dev.sh

cd "$(dirname "$0")/.." || exit 1

# Kill any existing next dev processes
pkill -f "next dev" 2>/dev/null || true

# Wait for processes to terminate
sleep 2

# Start the dev server
npm run dev
