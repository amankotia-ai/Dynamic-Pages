# Dynamic Pages

A powerful content personalization system using Supabase Edge Functions to dynamically modify web page content based on referrer information and URL parameters.

## Features

- **Dynamic Content Replacement**: Replace any HTML element on your page based on custom rules
- **Rule-Based Personalization**: Define rules based on referrer URL or query parameters
- **Edge Function Powered**: Fast, reliable content delivery using Supabase Edge Functions
- **Easy Integration**: Simple script tag integration on any website
- **Fallback Mechanisms**: Multiple fallback strategies ensure content is always delivered

## Getting Started

### Prerequisites

- Supabase account
- Node.js and npm (for local development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/amankotia-ai/Dynamic-Pages.git
cd Dynamic-Pages
```

2. **Set up Supabase**

Follow the instructions in `supabase-setup-instructions.md` to configure your Supabase project.

3. **Deploy the Edge Function**

```bash
cd unusual-clone/scripts
./deploy.sh
```

4. **Add the script to your website**

```html
<script src="https://[YOUR-PROJECT-ID].supabase.co/storage/v1/object/public/scripts/unusual.js?user_id=[YOUR-USER-ID]"></script>
```

Replace `[YOUR-PROJECT-ID]` with your Supabase project ID and `[YOUR-USER-ID]` with the user ID for which content should be retrieved.

## Usage

### Creating Personalization Rules

1. Log into your Supabase dashboard
2. Navigate to the SQL Editor
3. Insert a new source:

```sql
INSERT INTO sources (user_id, name, rule_type, rule_value, priority, active)
VALUES ('your-user-id', 'Google Traffic', 'referrer_contains', 'google.com', 1, true);
```

4. Add replacements for the source:

```sql
INSERT INTO replacements (source_id, selector, content)
VALUES 
('source-id', '#hero-banner', '<h1>Welcome Google Visitor!</h1><p>Special content just for you.</p>');
```

### Testing

Use the included `test-page.html` to verify your setup is working correctly.

## Project Structure

- `unusual-clone/client/src` - Client-side implementation
- `unusual-clone/scripts` - Client-side script and deployment utilities
- `unusual-clone/supabase/functions` - Supabase Edge Functions
- `unusual-clone/supabase/migrations` - Database schema and migrations

## Deployment

### To Vercel (Recommended)

For improved reliability, deploy this application to Vercel:

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables
3. Deploy with default settings

### Manual Deployment

Use the included `deploy.sh` script to deploy the Edge Function and client script directly to Supabase.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Supabase for their excellent Edge Functions feature
- The open-source community for inspiration and support 