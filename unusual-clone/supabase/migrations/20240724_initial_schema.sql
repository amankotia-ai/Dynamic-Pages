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
  current_param_name TEXT;
  current_param_value TEXT;
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
    FOR current_param_name, current_param_value IN
      SELECT s.param_name, s.param_value FROM public.sources s
      WHERE s.user_id = get_content.user_id
      AND s.active = true
      AND s.rule_type = 'url_param_equals'
      AND s.param_name IS NOT NULL
      AND s.param_value IS NOT NULL
    LOOP
      -- Check if URL has this parameter with matching value
      IF url_params LIKE '%' || current_param_name || '=' || current_param_value || '%' THEN
        SELECT id INTO matching_source_id FROM public.sources
        WHERE sources.user_id = get_content.user_id
        AND sources.active = true
        AND sources.rule_type = 'url_param_equals'
        AND sources.param_name = current_param_name
        AND sources.param_value = current_param_value
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