# Birochan Blog

This project is a Next.js blog platform that uses **NextAuth.js** for authentication and **Supabase** for data storage. Users can sign in with Google or via email and leave comments on posts. Email sign‑in is powered by SendGrid.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create an `.env` file** in the project root with the following variables:

   ```
# NextAuth.js Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

   # Email Provider (SMTP)
   SENDGRID_API_KEY=
   SENDGRID_FROM_EMAIL=
   SENDGRID_FROM_NAME=

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   Ensure all values are provided or authentication will fail. The `SENDGRID_FROM_EMAIL` must be a verified sender in your SendGrid account.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` in your browser.

## Authentication

- **Google** – OAuth 2.0 credentials from the Google Developer Console are required. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env` file.
- **NextAuth** – Configure `NEXTAUTH_URL` to the base URL of your site and set `NEXTAUTH_SECRET` to a random string. Add `<NEXTAUTH_URL>/api/auth/callback/google` as an authorized redirect URI in the Google Developer Console.
- **Email** – Uses SendGrid's SMTP service. Provide the `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and `SENDGRID_FROM_NAME` variables.
- **Supabase** – Acts as the database and NextAuth adapter. Supply `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project.

With valid credentials, users can sign in without errors and post comments on blog articles.

## Building for Production

Run the following commands to lint and build the application:

```bash
npm run lint
npm run build
```

The production build output will be generated in the `.next` directory.

## License

This project is provided for educational purposes. Feel free to modify and use it as a starting point for your own blog.
