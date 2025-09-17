# Birochan Blog

Birochan Blog is a content-focused site built with **Next.js 15**. It pairs a custom admin experience with Supabase storage, NextAuth authentication, and a modern UI powered by Tailwind CSS and shadcn/ui.

## Features

- Google one-click sign-in restricted to the owner (`mbirochan@gmail.com`).
- Email-based OTP login delivered via Gmail’s SMTP service.
- Full Supabase integration for posts, comments, and user profiles.
- Rich-text friendly post editor that preserves paragraphs and inline formatting.
- Admin-only dashboard to create, publish, and moderate posts or replies.
- Upvotes and threaded comments on public posts.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
# or npm install / yarn install
```

### 2. Configure Environment Variables

Create a `.env` file at the project root with the following keys:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GMAIL_USER=
GMAIL_APP_PASSWORD=
EMAIL_SERVER=smtp://GMAIL_USER:GMAIL_APP_PASSWORD@smtp.gmail.com:587
EMAIL_FROM=

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=mbirochan@gmail.com
ADMIN_SUPABASE_USER_ID=
SUPABASE_STORAGE_BUCKET=blog-images
```

> **Important**
> * `ADMIN_EMAILS` should contain a comma-separated list of admin emails.
> * `ADMIN_SUPABASE_USER_ID` must match the Supabase `auth.users` UUID for the owner.
> * `GMAIL_APP_PASSWORD` must be a valid Google App Password (2FA required).

### 3. Run the Development Server

```bash
pnpm run dev
```

Visit `http://localhost:3000` to view the blog. The admin dashboard lives at `/admin` and requires one of the configured admin accounts to sign in.

## Production Build

Lint and compile before deploying:

```bash
pnpm run lint
pnpm run build
```

Deploying on Vercel or a custom host requires the `.env` values to be set in the hosting platform as well.

## About the Author

**Birochan Mainali** is a software engineer passionate about design-focused products and friendly user experiences. You can reach out at `mbirochan@gmail.com`.

## License

This repository is made available for personal and educational projects. Fork it, tweak it, and make it your own.
