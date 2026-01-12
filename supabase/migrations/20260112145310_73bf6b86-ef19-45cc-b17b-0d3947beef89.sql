
-- Create user_stats table for tracking referral statistics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  total_recovered NUMERIC NOT NULL DEFAULT 0,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'converted')),
  invited_email TEXT,
  source TEXT NOT NULL DEFAULT 'copy' CHECK (source IN ('whatsapp', 'telegram', 'facebook', 'twitter', 'linkedin', 'email', 'copy')),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Create shared_successes table for public success wall
CREATE TABLE public.shared_successes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_opportunity_id UUID NOT NULL REFERENCES public.user_opportunities(id) ON DELETE CASCADE,
  amount_recovered NUMERIC NOT NULL,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  message TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_successes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for leaderboard (limited data)
CREATE POLICY "Anyone can view stats for leaderboard" ON public.user_stats
  FOR SELECT USING (true);

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- RLS policies for shared_successes
CREATE POLICY "Anyone can view public successes" ON public.shared_successes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own successes" ON public.shared_successes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their successes" ON public.shared_successes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their successes" ON public.shared_successes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_user_stats_referral_code ON public.user_stats(referral_code);
CREATE INDEX idx_user_stats_successful_referrals ON public.user_stats(successful_referrals DESC);
CREATE INDEX idx_user_stats_total_recovered ON public.user_stats(total_recovered DESC);
CREATE INDEX idx_shared_successes_is_public ON public.shared_successes(is_public);
CREATE INDEX idx_shared_successes_created_at ON public.shared_successes(created_at DESC);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to create user stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate unique referral code
  LOOP
    new_code := generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.user_stats WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  -- Create user stats with unique code
  INSERT INTO public.user_stats (user_id, referral_code)
  VALUES (NEW.id, new_code);
  
  RETURN NEW;
END;
$$;

-- Trigger to create user stats on new user
CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();

-- Function to update user stats when referral is converted
CREATE OR REPLACE FUNCTION public.update_referrer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
    UPDATE public.user_stats
    SET 
      successful_referrals = successful_referrals + 1,
      updated_at = now()
    WHERE user_id = NEW.referrer_id;
  END IF;
  
  IF NEW.status = 'registered' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE public.user_stats
    SET 
      total_referrals = total_referrals + 1,
      updated_at = now()
    WHERE user_id = NEW.referrer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for updating referrer stats
CREATE TRIGGER on_referral_status_change
  AFTER INSERT OR UPDATE OF status ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_referrer_stats();

-- Trigger for updated_at on user_stats
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
