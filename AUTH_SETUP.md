# NextAuth Setup Instructions

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select an existing one)

3. **Enable Google+ API**:

   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`

5. **Copy your credentials**:

   - Copy the Client ID
   - Copy the Client Secret

6. **Update .env file**:

   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

7. **Generate AUTH_SECRET**:

   ```bash
   openssl rand -base64 32
   ```

   Or use an online generator and update:

   ```env
   AUTH_SECRET="your-generated-secret-here"
   ```

8. **Update AUTH_URL** for production:
   ```env
   AUTH_URL="https://yourdomain.com"
   ```

## Testing

1. Run your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign in with Google"

4. Complete the Google authentication flow

5. You should be redirected to `/projects` page

## Routes

- `/` - Landing page (public)
- `/projects` - Browse projects (public)
- `/dashboard/*` - Dashboard pages (requires authentication)

## Authentication Flow

- Landing page has "Sign in with Google" button
- On successful authentication, redirects to `/projects`
- Unauthenticated users can access `/` and `/projects`
- `/dashboard/*` routes require authentication (redirect to `/` if not authenticated)
