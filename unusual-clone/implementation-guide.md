# Implementation Guide for Unusual Clone

This guide provides the essential steps to complete the setup and deployment of the Unusual Clone application.

## 1. Set Up Your Supabase Project

Follow the detailed instructions in `supabase-setup-instructions.md` to:

- Create the required database tables and RLS policies
- Add the content retrieval stored procedure
- Set up storage for the client script
- Configure Supabase Auth settings (important):
  - Disable email confirmations in Supabase Auth settings
  - Set allowed redirect URLs for your development and production environments

## 2. Configure Environment Variables

1. Create a `.env.local` file in the `client` directory:

```
REACT_APP_SUPABASE_URL=https://gckvjovozupvteqivjiv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs
```

## 3. Test Local Development

1. Install dependencies and start the development server:

```bash
cd unusual-clone/client
npm install
npm start
```

2. Access the application at http://localhost:3000
3. Register a new user (email confirmations are disabled for easier testing)
4. Create a source and test it

## 4. Deploy the Client Script

1. Minify the `unusual.js` script:

```bash
cd unusual-clone
npx uglify-js scripts/unusual.js -o scripts/unusual.min.js
```

2. Upload the minified script to your Supabase storage bucket:
   - Go to Supabase Dashboard > Storage
   - Select the "scripts" bucket
   - Upload the `unusual.min.js` file

## 5. Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. In Vercel, create a new project and import your repository
3. Configure environment variables:
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. Deploy the project

## 6. Test End-to-End

1. Register a new user on your deployed app
2. Create a source with rules and content replacements
3. Get the script tag from the Script page
4. Add it to a test website (or use the following HTML as a test page):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Unusual Test Page</title>
</head>
<body>
  <h1 id="hero-title">This is the default title</h1>
  <p>This content will remain unchanged</p>
  <a href="#" class="cta-button">Default Button Text</a>
  
  <!-- Add your script here -->
  <script src="https://gckvjovozupvteqivjiv.supabase.co/storage/v1/object/public/scripts/unusual.js?user_id=YOUR_USER_ID"></script>
</body>
</html>
```

5. Test the personalization with different referrers or URL parameters

## 7. Common Issues and Fixes

### Authentication Problems
- Ensure email confirmations are disabled in Supabase Dashboard > Authentication > Email
- If you have email domain restrictions, adjust them in Supabase Dashboard > Authentication > Email Domains
- Ensure redirect URLs are set up correctly for local development and production

### Content Not Updating
- Check browser console for errors
- Verify selectors match elements exactly
- Confirm the script URL includes your correct user ID

### Database Permissions
- Verify RLS policies are properly configured
- Test querying tables directly to check permissions

## Next Steps

- Add analytics tracking to measure personalization effectiveness
- Implement A/B testing for different personalization strategies
- Add support for more complex targeting rules (e.g., geo-location, device type)
- Create prebuilt templates for common personalization scenarios 