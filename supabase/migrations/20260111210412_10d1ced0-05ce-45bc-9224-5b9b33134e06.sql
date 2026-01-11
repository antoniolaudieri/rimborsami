-- Create company_contacts table for real company contact information
CREATE TABLE public.company_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  email_reclami TEXT,
  pec_reclami TEXT,
  indirizzo_sede_legale TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can view company contacts (public data)
CREATE POLICY "Anyone can view company contacts" 
ON public.company_contacts 
FOR SELECT 
USING (true);

-- Only admins can manage company contacts
CREATE POLICY "Admins can manage company contacts" 
ON public.company_contacts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add outcome column to user_opportunities for tracking results
ALTER TABLE public.user_opportunities 
ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('pending', 'success', 'rejected', 'partial', 'unknown'));

-- Create trigger for updated_at
CREATE TRIGGER update_company_contacts_updated_at
BEFORE UPDATE ON public.company_contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();