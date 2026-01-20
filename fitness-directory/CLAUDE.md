# Claude Code Notes

## Restarting the Dev Server

**IMPORTANT:** Always use the full path to ensure correct working directory.

```bash
cd /mnt/c/Users/me/fitness-directory && pkill -f "next dev" 2>/dev/null; sleep 2; npm run dev
```

Or use the helper script:
```bash
/mnt/c/Users/me/fitness-directory/scripts/dev.sh
```

**Why this matters:**
- The working directory can change during a session
- Running `npm run dev` from the wrong directory fails with "package.json not found"
- Always use absolute paths or `cd` to the project directory first

## Running Scripts with Environment Variables

Scripts like `index-all.ts` need environment variables loaded:

```bash
cd /mnt/c/Users/me/fitness-directory && export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/index-all.ts
```

## Project Structure

- Next.js 16 App Router
- Supabase for database and auth
- Typesense for search
- Tailwind CSS for styling
