-- Create enum for email connection status
CREATE TYPE public.email_connection_status AS ENUM ('connected', 'error', 'credentials_expired', 'syncing');

-- Create email_connections table
CREATE TABLE public.email_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'altro',
  email_address TEXT NOT NULL,
  imap_server TEXT NOT NULL,
  imap_port INTEGER NOT NULL DEFAULT 993,
  encrypted_password TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  emails_scanned INTEGER DEFAULT 0,
  opportunities_found INTEGER DEFAULT 0,
  status public.email_connection_status NOT NULL DEFAULT 'connected',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scanned_emails table
CREATE TABLE public.scanned_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES public.email_connections(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  subject TEXT,
  sender TEXT,
  sender_domain TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  body_preview TEXT,
  analyzed BOOLEAN DEFAULT false,
  analysis_result JSONB DEFAULT '{}'::jsonb,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  user_opportunity_id UUID REFERENCES public.user_opportunities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_email_connections_user_id ON public.email_connections(user_id);
CREATE INDEX idx_email_connections_status ON public.email_connections(status);
CREATE INDEX idx_scanned_emails_user_id ON public.scanned_emails(user_id);
CREATE INDEX idx_scanned_emails_connection_id ON public.scanned_emails(connection_id);
CREATE INDEX idx_scanned_emails_sender_domain ON public.scanned_emails(sender_domain);
CREATE INDEX idx_scanned_emails_analyzed ON public.scanned_emails(analyzed);
CREATE UNIQUE INDEX idx_scanned_emails_message_unique ON public.scanned_emails(connection_id, message_id);

-- Enable RLS
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_connections
CREATE POLICY "Users can view own email connections"
  ON public.email_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email connections"
  ON public.email_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email connections"
  ON public.email_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email connections"
  ON public.email_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for scanned_emails
CREATE POLICY "Users can view own scanned emails"
  ON public.scanned_emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanned emails"
  ON public.scanned_emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scanned emails"
  ON public.scanned_emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scanned emails"
  ON public.scanned_emails FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on email_connections
CREATE TRIGGER update_email_connections_updated_at
  BEFORE UPDATE ON public.email_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();