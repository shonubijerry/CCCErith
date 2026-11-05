# CCC Erith Parish website

Website and content admin for **Celestial Church of Christ Noah’s Ark Erith Parish**.

- **Site:** Next.js 16 + [Payload CMS 3](https://payloadcms.com), running on **Cloudflare Workers** (via OpenNext)
- **Database:** Cloudflare D1 · **Images:** Cloudflare R2 · **Email:** Cloudflare Email Service
- **Admin:** `/admin` — editors manage the home page (hero carousel slides + settings, photo strip), the About Us and
  Community Service pages, sermons, special events, weekly services, ministries, gallery albums, the team page,
  policy pages and site settings (contact details, social links, PayPal link).

### Hero carousel

*Home page → Hero carousel* holds the slides (image or short video, optional heading/text/button each) and the
carousel settings: autoplay, seconds per slide, transition (crossfade + zoom / slide / curtain wipe), speed, arrows,
dots, pause-on-hover and overlay darkness. Videos play muted and move on when they finish; visitors with
“reduce motion” or phone data-saver on see the video’s cover image instead. Keep videos short (≈10–15s), 720p,
without audio — e.g. `ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 27 -movflags +faststart out.mp4`.

## Local development

Requires Node `^22.23.4 || >=24.22.1` and pnpm.

```bash
pnpm install
cp .env.example .env                 # set PAYLOAD_SECRET (openssl rand -hex 32)
pnpm payload migrate                 # create the local database (in .wrangler/state)
pnpm images && pnpm seed             # optional: load the real church content (needs scripts/wp-export/, see below)
pnpm dev                             # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

The first visit to `/admin` on an empty database asks you to create the first login — make it an **Admin**.

Checks: `pnpm lint`, `npx tsc --noEmit`, `pnpm test:int` (backup logic), `pnpm test:e2e` (needs seeded data).

### Content import from the old WordPress site

`scripts/wp-export/` (git-ignored) holds the files pulled from the old site. `scripts/prepare-images.mjs`
shrinks the photos to WebP (the dove hero video was re-encoded with ffmpeg into the same folder), and
`scripts/seed.ts` loads the home carousel, About/Community pages, policies, ministries, the weekly timetable, the team,
gallery albums and settings. It refuses to run on a database that already has content unless `SEED_RESET=1`
(which wipes content but keeps logins).

## Deploying (first time)

Cloudflare **Workers Paid** plan ($5/month) is required (bundle size). All commands run from this folder.

```bash
pnpm wrangler login

# 1. Create resources
pnpm wrangler d1 create cccerith                 # copy the database_id it prints
pnpm wrangler r2 bucket create cccerith-media
pnpm wrangler r2 bucket create cccerith-backups
```

2. In `wrangler.jsonc` replace `REPLACE_WITH_D1_DATABASE_ID` (twice) and `REPLACE_WITH_ACCOUNT_ID`.
   Until the domain moves, set `NEXT_PUBLIC_SERVER_URL` to the `*.workers.dev` address.

3. Secrets:

```bash
openssl rand -hex 32 | pnpm wrangler secret put PAYLOAD_SECRET
pnpm wrangler secret put CF_API_TOKEN          # API token with "D1: Edit" on this account (used by backups)
pnpm wrangler secret put TURNSTILE_SECRET_KEY  # from Cloudflare dashboard → Turnstile (add the site first)
```

4. Public build settings — create `.env.production` (not committed) with:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...      # Turnstile site key
NEXT_PUBLIC_CF_ANALYTICS_TOKEN=...      # Web Analytics token (optional once the domain is on Cloudflare: enable automatic setup instead)
NEXT_PUBLIC_IMAGE_RESIZING=false        # set true after the domain moves to Cloudflare (see below)
```

5. Deploy: `pnpm run deploy` (runs migrations on D1, builds, uploads).

6. Load content into the live database: `pnpm seed:remote`, then open `/admin` and create the first admin login.

**Email (contact form + password reset):** enable Cloudflare **Email Service** for `cccerithparish.co.uk`
(Dashboard → Email → Email Service → onboard the domain; it adds SPF/DKIM records and does not touch MX).
Mail is sent from `website@cccerithparish.co.uk` to the address in *Site settings*. Every contact message
is also saved under **Inbox → Contact messages** in the admin, so nothing is lost if email is not yet set up.

## Going live on cccerithparish.co.uk

1. Back up the old WordPress site (cPanel → Backup, full download).
2. Set up **Zoho Mail** for the domain first and note its MX/SPF/DKIM records.
3. Add the domain to Cloudflare (Free plan is fine) — it imports existing DNS. Check the imported records,
   then replace the IONOS mail records with Zoho’s.
4. At IONOS, change the domain’s **nameservers** to the two Cloudflare gives you. (The domain stays registered at IONOS —
   move it to a domain-only package before cancelling hosting.)
5. Workers → `cccerith` → Settings → Domains & Routes → add `cccerithparish.co.uk` and `www.cccerithparish.co.uk`.
6. Set `NEXT_PUBLIC_SERVER_URL=https://cccerithparish.co.uk` and `NEXT_PUBLIC_IMAGE_RESIZING=true`, enable
   **Images → Transformations** for the zone, and redeploy. (Free tier: 5,000 unique resizes/month — plenty.)
7. Test email in/out, the contact form and the admin, then cancel IONOS hosting ~2 weeks later.

Old WordPress addresses (`/contacts`, `/our-ministries`, `/latest-sermons`, `/donation-page`, …) redirect to the new pages
(see `next.config.ts`).

## Backups

`custom-worker.ts` runs `src/lib/backup.ts` nightly at 02:00 UTC into the `cccerith-backups` bucket:

- every night, newly uploaded images are copied (each file only once);
- every **Sunday**, a restore point is written: `points/<date>/database.sql.gz` + `manifest.json`;
- only after a new point is safely written are older points deleted — **the latest 2 are always kept**,
  along with exactly the image copies they need.

This stays within R2’s free tier. Admins can make a restore point immediately with `POST /api/backup` while logged in.
D1 also keeps its own 30-day point-in-time history (`wrangler d1 time-travel`).

**Restoring:** download `database.sql.gz` from the bucket, `gunzip` it, then
`pnpm wrangler d1 execute cccerith --remote --file database.sql` (into an empty database). Copy images back from
`media/<etag>/<filename>` to the same `<filename>` in `cccerith-media` (the manifest lists them).

## Project map

| Path | What |
| --- | --- |
| `src/collections`, `src/globals` | Content types editors manage |
| `src/app/(frontend)` | Public pages · `globals.css` holds the design system (brand colours at the top) |
| `src/components/site` | Page UI (hero carousel, cards, headers…) |
| `src/components/motion` | Animations: reveals, word-by-word headings, image masks, parallax, tilt, timeline, photo strip — all respect “reduce motion” |
| `src/lib/backup.ts`, `custom-worker.ts` | Nightly backups |
| `src/lib/cloudflareEmail.ts` | Email via Cloudflare Email Service |
| `scripts/` | WordPress import (`seed.ts`, `prepare-images.mjs`) |
