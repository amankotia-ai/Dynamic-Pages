# Unusual Clone Edge Functions

This directory contains the Supabase edge functions for the Unusual Clone application. The primary function is `get_content`, which retrieves personalized content for users based on referrer and URL parameters.

## Setup and Deployment

### Local Development

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref gckvjovozupvteqivjiv
   ```

4. For local development, you can serve the functions locally:
   ```bash
   supabase functions serve get_content
   ```

5. Test the function locally:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/get_content \
     -H "Content-Type: application/json" \
     -d '{"user_id":"94ea550b-0f42-4266-81a6-94888a1eb91a","referrer":"https://example.com","url":"https://yoursite.com?param=value"}'
   ```

### Deployment

Deploy your function to Supabase:

```bash
supabase functions deploy get_content
```

## Function Overview

The `get_content` function retrieves content replacements based on user-defined rules. It follows these steps:

1. Receives a request with `user_id`, `referrer`, and `url`
2. Fetches all active sources for the specified user
3. Finds the first matching source based on either:
   - Referrer contains a specific string, or
   - URL has a specific parameter with a specific value
4. Returns replacements for the matching source

## Request Format

```json
{
  "user_id": "user-uuid",
  "referrer": "https://referring-site.com",
  "url": "https://current-page.com?param=value"
}
```

- `user_id`: Required. The UUID of the user whose sources should be checked.
- `referrer`: Optional. The referring URL.
- `url`: Required. The current page URL.

## Response Format

### Success Response

```json
{
  "replacements": [
    {
      "selector": ".hero-title",
      "content": "<h1>New Title</h1>"
    },
    {
      "selector": "#main-cta",
      "content": "<button>Custom CTA</button>"
    }
  ],
  "success": true,
  "source_id": "matched-source-uuid"
}
```

### No Matches Found

```json
{
  "replacements": [],
  "success": true
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Debugging

The function includes extensive logging. When deployed to Supabase, you can view these logs in the Supabase dashboard under the Edge Functions section.

Common issues and solutions:

1. **CORS errors**: The function includes CORS headers to allow requests from any origin. If you're still experiencing CORS issues, make sure your client is making requests correctly.

2. **Auth errors**: Ensure you're using the correct Supabase URL and anon key.

3. **No content replacements**: Check that:
   - The user has active sources defined
   - The rule conditions match your test case
   - The source has replacements defined

## Rate Limiting

Supabase Edge Functions have the following limits:

- Execution time: 2 seconds max
- Memory: 1GB max
- Invocations: Varies by plan

For high-traffic production use, consider implementing caching or more efficient database queries.

## Security Considerations

1. The function uses the anon key for database access, which means it can only read data that is publicly accessible or explicitly allowed by Row Level Security (RLS) policies.

2. Make sure your RLS policies are correctly set up to prevent unauthorized access to data.

3. Always validate input parameters to prevent injection attacks.

## Client-Side Integration

The client-side script (`unusual.js`) is designed to work with this edge function. It will:

1. Extract the user ID from URL parameters or script tag attributes
2. Call the edge function with the user ID, referrer, and current URL
3. Apply the returned replacements to the page DOM

For more details on client integration, see the main README.md file in the project root. 