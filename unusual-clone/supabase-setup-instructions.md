# Supabase Setup Instructions

Follow these steps to set up your Supabase project for the Unusual Clone application.

## 1. Run Database Migrations

Go to your Supabase dashboard at: https://app.supabase.com/project/gckvjovozupvteqivjiv/sql

Create a new query and paste the following SQL to set up the database schema:

```sql
-- Create sources table
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('referrer_contains', 'url_param_equals')),
  rule_value TEXT NOT NULL,
  param_name TEXT NULL,
  param_value TEXT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create replacements table for source content changes
CREATE TABLE IF NOT EXISTS public.replacements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  selector TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replacements ENABLE ROW LEVEL SECURITY;

-- Create policies for sources
CREATE POLICY "Users can view their own sources" 
  ON public.sources FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources" 
  ON public.sources FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources" 
  ON public.sources FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources" 
  ON public.sources FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for replacements
CREATE POLICY "Users can view replacements for their sources" 
  ON public.replacements FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.sources 
    WHERE sources.id = replacements.source_id AND sources.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert replacements for their sources" 
  ON public.replacements FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sources 
    WHERE sources.id = replacements.source_id AND sources.user_id = auth.uid()
  ));

CREATE POLICY "Users can update replacements for their sources" 
  ON public.replacements FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.sources 
    WHERE sources.id = replacements.source_id AND sources.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete replacements for their sources" 
  ON public.replacements FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.sources 
    WHERE sources.id = replacements.source_id AND sources.user_id = auth.uid()
  ));
```

## 2. Create Stored Procedure for Content Retrieval

Create another SQL query and paste the following to add the content retrieval function:

```sql
-- Create stored procedure for get_content to use in the client script
CREATE OR REPLACE FUNCTION public.get_content(user_id UUID, referrer TEXT, url TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  matching_source_id UUID;
  result JSONB;
  url_params TEXT;
  param_name TEXT;
  param_value TEXT;
BEGIN
  -- Extract URL parameters part
  url_params := substr(url, position('?' in url) + 1);
  
  -- Find a matching source by referrer rule
  SELECT id INTO matching_source_id FROM public.sources
  WHERE sources.user_id = get_content.user_id
  AND sources.active = true
  AND sources.rule_type = 'referrer_contains'
  AND position(sources.rule_value in get_content.referrer) > 0
  ORDER BY priority ASC
  LIMIT 1;
  
  -- If no referrer match, try URL param rule
  IF matching_source_id IS NULL THEN
    FOR param_name, param_value IN
      SELECT s.param_name, s.param_value FROM public.sources s
      WHERE s.user_id = get_content.user_id
      AND s.active = true
      AND s.rule_type = 'url_param_equals'
      AND s.param_name IS NOT NULL
      AND s.param_value IS NOT NULL
    LOOP
      -- Check if URL has this parameter with matching value
      IF url_params LIKE '%' || param_name || '=' || param_value || '%' THEN
        SELECT id INTO matching_source_id FROM public.sources
        WHERE sources.user_id = get_content.user_id
        AND sources.active = true
        AND sources.rule_type = 'url_param_equals'
        AND sources.param_name = param_name
        AND sources.param_value = param_value
        ORDER BY priority ASC
        LIMIT 1;
        
        EXIT WHEN matching_source_id IS NOT NULL;
      END IF;
    END LOOP;
  END IF;
  
  -- If we found a matching source, get its replacements
  IF matching_source_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'replacements', jsonb_agg(jsonb_build_object(
        'selector', r.selector,
        'content', r.content
      ))
    ) INTO result
    FROM public.replacements r
    WHERE r.source_id = matching_source_id;
    
    RETURN result;
  END IF;
  
  -- No match found, return empty replacements
  RETURN jsonb_build_object('replacements', jsonb_build_array());
END;
$$;
```

## 3. Set Up Storage for Client Script

1. Go to the Storage tab in your Supabase dashboard
2. Create a new bucket called `scripts`
3. Make the bucket public by clicking on the ⚙️ icon next to the bucket name and enabling "Public Bucket"
4. Upload the `unusual.js` file from your project's `scripts` directory
5. Right-click on the file and select "Get URL" to confirm you can access it publicly

## 4. Enable Auth Settings

1. Go to the Authentication tab in your Supabase dashboard
2. Under "URL Configuration", ensure the Site URL is set to your Vercel deployment URL (when you deploy)
3. Also add `http://localhost:3000` to the Redirect URLs for local development

## 5. Set Up Edge Functions (Optional)

If you prefer using Edge Functions instead of the SQL function:

1. Go to the Edge Functions tab in your Supabase dashboard
2. Click "Create a new function"
3. Name it "get_content"
4. Paste the content of the `supabase/functions/get_content.ts` file and deploy

Your Supabase project is now ready to use with the Unusual Clone application. 