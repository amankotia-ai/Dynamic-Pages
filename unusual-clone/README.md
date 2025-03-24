# Unusual Clone

A clone of Unusual - a tool for personalizing website content based on visitor sources, with Webflow integration.

## Project Overview

This project enables website owners to personalize content for visitors based on:
- Referrer URLs (e.g., traffic from Facebook vs. Twitter)
- URL parameters (e.g., source=email)

With a simple two-line script integration, website owners can customize their content for different traffic sources without changing their codebase.

## Tech Stack

### Backend
- Supabase (PostgreSQL, Authentication, Storage)
- Supabase Edge Functions / PostgreSQL Stored Procedures

### Frontend
- React v18.x
- TypeScript
- React Router v6.x
- Supabase JavaScript Client
- TailwindCSS for styling

### Client Script
- Vanilla JavaScript (ES6+)
- Fetch API

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- Supabase account
- Vercel account (for deployment)

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/migrations/20240724_initial_schema.sql` in the Supabase SQL editor to create the required tables
3. Deploy the Edge Function in `supabase/functions/get_content.ts` (optional - we're using a stored procedure in most cases)
4. Create a Storage bucket named `scripts` and make it public
5. Upload the compiled `unusual.js` script to the `scripts` bucket

### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd unusual-clone
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Create a `.env.local` file in the client directory:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the frontend development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Deployment to Vercel

1. Push your code to GitHub, GitLab, or Bitbucket
2. Connect your repository to Vercel
3. Set the following environment variables in Vercel:
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. Deploy

## Features

- **User Authentication**: Secure login and registration via Supabase Auth
- **Source Management**: Create, read, update, and delete personalization sources
- **Rule-Based Personalization**: Define rules for when content should be shown
- **Content Replacements**: Specify which elements to replace and with what content
- **Script Generator**: Generate an embed script for easy integration
- **Webflow Support**: Ready to integrate with Webflow via custom code injection

## Integration Guide

### Standard Website Integration

1. Get your script from the dashboard after logging in
2. Add the script just before the `</body>` tag in your HTML:

```html
<script src="https://gckvjovozupvteqivjiv.supabase.co/storage/v1/object/public/scripts/unusual.js?user_id=YOUR_ID"></script>
```

### Webflow Integration

1. In your Webflow project, go to Project Settings
2. Navigate to the Custom Code tab
3. Paste your script in the "Before </body> tag" section
4. Save and publish your site

## License

MIT

## Acknowledgements

This project is a clone of [Unusual](https://unusual.dev/) created for educational purposes. 