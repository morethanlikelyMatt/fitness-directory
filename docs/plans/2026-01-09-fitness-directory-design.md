# Fitness Center Directory - Design Document

## Overview

An AI-powered global fitness center directory with search by equipment, amenities, geography, and specialties. Owners can claim or submit fitness centers and subscribe to premium tiers for enhanced listings.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router, TypeScript, Tailwind CSS)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Search:** Typesense Cloud
- **Payments:** Stripe (subscriptions)
- **Hosting:** Vercel
- **Maps:** Mapbox or Google Maps

---

## Architecture

### High-Level Data Flow

1. Fitness center data lives in Supabase PostgreSQL
2. Changes sync to Typesense via database webhooks (Supabase Edge Function)
3. Search queries hit Typesense directly from the frontend
4. User auth handled by Supabase Auth with social providers
5. Stripe webhooks update subscription status in Supabase
6. Images stored in Supabase Storage with CDN delivery

### Three Main User Experiences

1. **Public site** - Search, browse, view listings (SEO-optimized)
2. **Owner dashboard** - Claim/manage listings, subscription, analytics
3. **Admin CMS** - Moderation, content management, platform analytics

---

## Data Model

### Core Tables

```sql
fitness_centers
├── id (uuid, primary key)
├── name, slug (for SEO URLs)
├── description
├── address, city, state, country, postal_code
├── latitude, longitude
├── phone, email, website
├── hours (jsonb)
├── price_range (enum: $, $$, $$$, $$$$)
├── gym_type (enum: commercial, boutique, crossfit, powerlifting, 24hour, womens, rehab, etc.)
├── status (enum: pending, verified, claimed, suspended)
├── owner_id (fk to users, nullable)
├── subscription_tier (enum: free, premium)
├── created_at, updated_at

fitness_center_details (1:1 extension - ALL rich content)
├── fitness_center_id
├── photos (array of storage URLs)
├── virtual_tour_url
├── class_schedule (jsonb)
├── detailed_equipment_list (jsonb)
├── staff_bios (jsonb)
├── contract_terms (text)
├── guest_policy (text)
├── childcare_details (jsonb)
├── recovery_services (jsonb)

fitness_center_attributes (many-to-many for filterable attributes)
├── fitness_center_id
├── attribute_id
├── value (text, optional)
├── quantity (integer, optional)

attributes (lookup table)
├── id, name, slug
├── category (enum: equipment, amenity, class, specialty, recovery)
├── icon

premium_config (controls what requires paid subscription)
├── field_name (e.g., "photos", "contract_terms", "equipment_quantity")
├── field_type (enum: detail, attribute)
├── is_premium (boolean)
├── updated_at

users
├── id (uuid, matches Supabase Auth)
├── email, name
├── role (enum: user, owner, admin)
├── favorite_centers (uuid array)
├── alert_preferences (jsonb)
├── created_at

subscriptions
├── id
├── user_id (owner)
├── fitness_center_id
├── stripe_subscription_id
├── status (active, canceled, past_due)
├── current_period_end

submissions
├── id
├── fitness_center_id (nullable - null if new submission)
├── user_id
├── type (enum: claim, new_submission, suggestion)
├── is_owner (boolean)
├── submitted_data (jsonb)
├── verification_docs (array of storage URLs)
├── status (pending, approved, rejected, needs_info)
├── admin_notes
├── submitted_at, reviewed_at
```

### Access Control Logic

```javascript
function canShowField(listing, fieldName) {
  const config = premium_config.get(fieldName);
  if (!config.is_premium) return true;
  return listing.subscription_tier === 'premium'
         && subscription.status === 'active';
}
```

---

## Search & Typesense Integration

### Typesense Collection Schema

```
fitness_centers_search
├── id (string)
├── name (string, searchable)
├── description (string, searchable)
├── gym_type (string, facet)
├── address_full (string, searchable)
├── city (string, facet)
├── state (string, facet)
├── country (string, facet)
├── location (geopoint - [lat, lng])
├── price_range (string, facet)
├── hours_today (string)
├── is_24_hour (bool, facet)
├── attributes (string array)
├── attribute_categories (string array)
├── subscription_tier (string)
├── status (string)
├── updated_at (int64)
```

### Sync Strategy

1. Supabase database webhook fires on `fitness_centers` insert/update/delete
2. Edge Function receives webhook, enriches with attributes, pushes to Typesense
3. Runs async - search index is eventually consistent (typically <1 second)

### Search Features

| Feature | Implementation |
|---------|----------------|
| Natural language | Typesense query parser handles "gym with pool near Austin" |
| Geo search | `filter_by: location:(30.27, -97.74, 10 mi)` |
| Faceted filters | Sidebar checkboxes for equipment, amenities, gym type |
| Typo tolerance | Built into Typesense |
| Autocomplete | Typesense search-as-you-type on name + attributes |
| Premium boost | `sort_by: _text_match:desc, subscription_tier:desc` |

---

## User Flows & Pages

### Public Site (SEO-optimized)

```
/ (homepage)
├── Hero with search bar (NL input + location)
├── Popular cities/regions
├── Featured categories

/search
├── Natural language search bar
├── Faceted sidebar
├── Map view toggle
├── Results with pagination
├── "Don't see your gym? Add it →" CTA

/gym/[slug]
├── Basic info (always visible)
├── Attributes list (quantity gated by premium_config)
├── Premium content section (gated or blurred with CTA)
├── "Claim this listing" / "Own a gym? Submit it →"
├── Map embed

/cities/[country]/[city]
├── SEO landing pages with pre-filtered results

/login, /signup
├── Email/password + social (Google, Facebook, Apple)
```

### Searcher Dashboard

```
/dashboard
├── Saved favorites
├── Search alerts management
├── Account settings
```

### Owner Dashboard

```
/owner
├── My listings (claimed/pending/submitted)
├── Subscription status

/owner/listings/[id]/edit
├── Edit basic info, attributes
├── Upload photos, set schedules (premium fields)
├── Preview listing

/owner/billing
├── Stripe Customer Portal

/submit
├── Step 1: Search first (prevent duplicates)
├── Step 2: Basic info form
├── Step 3: Attributes
├── Step 4: Verification
├── Step 5: Confirmation + premium upsell
```

### Admin CMS

```
/admin
├── Overview stats, activity feed

/admin/listings
├── Filterable table, bulk actions
├── Manual add, CSV import

/admin/claims → /admin/submissions
├── Queue of pending claims/submissions
├── Verification review, approve/reject

/admin/users
├── Role management, suspend/ban

/admin/subscriptions
├── Revenue metrics, Stripe dashboard link

/admin/premium-config
├── Toggle interface for field premium status

/admin/attributes
├── Manage attribute library
```

---

## Payments & Stripe Integration

### Subscription Model

- **Free:** $0 - basic listing
- **Premium:** $X/month or $Y/year

### Integration Flow

1. Owner clicks "Upgrade to Premium"
2. POST /api/stripe/create-checkout-session
3. Redirect to Stripe Checkout
4. User completes payment
5. Stripe webhook: checkout.session.completed
6. Edge Function activates subscription, updates Typesense

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription |
| `invoice.paid` | Renewal succeeded |
| `invoice.payment_failed` | Mark past_due, notify owner |
| `customer.subscription.deleted` | Downgrade to free |
| `customer.subscription.updated` | Handle plan changes |

### Downgrade Handling

- Set `subscription_tier = 'free'`
- Premium content stays in database but stops displaying
- Owner can re-upgrade anytime

---

## SEO Strategy

### Technical SEO

- Server-side rendering for all pages
- Dynamic metadata per page
- JSON-LD LocalBusiness structured data
- Auto-generated sitemap.xml

### URL Structure

```
/gym/planet-fitness-austin-downtown
/cities/us/tx/austin
/equipment/squat-racks
/specialty/crossfit
```

### Programmatic Landing Pages

- /cities/[country]/[state]/[city]
- /equipment/[attribute]
- /specialty/[specialty]
- Only generate pages with >3 listings

---

## Anti-Scraping Measures

### robots.txt

```
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Bytespider
Disallow: /
```

### Additional Layers

- Rate limiting middleware
- Cloudflare free tier (basic bot protection)
- Upgrade to Cloudflare Pro if scraping becomes problematic

---

## Deployment & Infrastructure

### Services

| Service | Tier | Purpose |
|---------|------|---------|
| Vercel | Free/Pro ($20/mo) | Next.js hosting |
| Supabase | Free → Pro ($25/mo) | Database, auth, storage |
| Typesense Cloud | Free → $29/mo | Search |
| Stripe | 2.9% + $0.30/txn | Payments |
| Mapbox/Google Maps | Free tier | Geocoding, maps |
| Cloudflare | Free | DNS, CDN, bot protection |

### Environments

- **Development:** Local Supabase, Typesense Docker
- **Staging:** Separate Supabase project, Typesense test cluster
- **Production:** Production instances of all services

---

## Next Steps

1. Set up project repository and initial Next.js scaffold
2. Configure Supabase project with schema
3. Set up Typesense Cloud and sync infrastructure
4. Build core search and listing pages
5. Implement auth flows
6. Build owner dashboard and submission flows
7. Integrate Stripe subscriptions
8. Build admin CMS
9. SEO optimization and landing page generation
10. Seed initial data for key markets
