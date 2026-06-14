# ROOH & RANG Stories

Premium wedding photography website and private client gallery portal for ROOH & RANG Stories.

The MVP includes a public studio website, protected admin panel, client/event/album/media management, PIN-protected galleries, favorites, download tracking, inquiry capture, and Google Drive OAuth foundations. Google passwords are never stored; Drive access uses OAuth tokens encrypted with `TOKEN_ENCRYPTION_KEY`.

## Features

- Public pages: Home, Portfolio, Services, Packages, About, Contact, Client Login
- Contact inquiry form with database persistence
- Protected admin login with signed HTTP-only session cookie
- Admin dashboard with live counts
- Clients CRUD
- Drive account records with Google OAuth connect callback
- Events CRUD with 4 digit PIN, publish/unpublish, download toggle, and expiry options
- Album CRUD, including default event albums
- Media metadata management and Drive folder metadata import
- Private route: `/gallery/[eventSlug]`
- Gallery PIN verification and visitor session cookie
- Favorites / album selection tracking
- Download permission checks and download tracking
- Prisma schema and seed data for a test gallery

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- Zod validation
- bcryptjs for admin password and PIN hashing
- Google APIs Node client for Drive OAuth/listing

## Local Setup

1. Install Node.js 20.9 or newer. Node 24 works with this project.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and fill values:

```bash
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_SECRET=
APP_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
TOKEN_ENCRYPTION_KEY=
```

`TOKEN_ENCRYPTION_KEY` must be a base64 encoded 32 byte key. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Create/apply database tables:

```bash
npm run db:migrate
```

6. Seed starter data:

```bash
npm run db:seed
```

7. Start local development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin

Admin login:

```text
http://localhost:3000/admin/login
```

Use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

The seed creates a sample client, Drive account placeholder, published sample event, default albums, and sample media metadata. The sample gallery URL is:

```text
http://localhost:3000/gallery/rahul-priya-wedding
```

The seeded gallery PIN is `1234` for local testing only.

## Google Drive Setup

In Google Cloud Console:

- Enable Google Drive API
- Configure OAuth consent screen
- Create OAuth Client ID for a web app
- Add redirect URI: `http://localhost:3000/api/google/callback`
- Put the OAuth client ID and secret in `.env`

In admin:

1. Add a Drive Account.
2. Click the connect icon.
3. Complete Google OAuth.
4. Open an event and use “Create Drive Folders” after the account is connected.
5. Use Media Library import to import file metadata from a Drive folder ID.

The app starts with `drive.file` scope plus user email scope. If you need to list/import folders created outside this app, Google may require broader Drive permissions.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Current MVP Limits

- Drive import stores metadata and preview links; advanced secure streaming can be improved later.
- ZIP downloads, watermark generation, face recognition, WhatsApp automation, payments, and advanced analytics are future features.
- Website content is mostly static, with schema support ready for future editing screens.

No real secrets should be committed. `.env` is ignored by Git.
