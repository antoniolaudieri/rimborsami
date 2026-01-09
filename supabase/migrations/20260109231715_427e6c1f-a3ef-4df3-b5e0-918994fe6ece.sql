-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create opportunity_category enum
CREATE TYPE public.opportunity_category AS ENUM ('flight', 'ecommerce', 'bank', 'insurance', 'warranty', 'other');

-- Create opportunity_status enum
CREATE TYPE public.opportunity_status AS ENUM ('found', 'started', 'sent', 'completed', 'expired');

-- Create subscription_plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'monthly', 'annual');

-- Create subscription_status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Create notification_type enum
CREATE TYPE public.notification_type AS ENUM ('new_opportunity', 'deadline', 'reminder', 'system');

-- Create document_type enum
CREATE TYPE public.document_type AS ENUM ('email', 'pdf', 'image');

-- Create request_type enum
CREATE TYPE public.request_type AS ENUM ('email', 'pec', 'form');

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    quiz_answers JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    estimated_total_recovery INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_ROLES TABLE (separate from profiles for security)
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- OPPORTUNITIES TABLE (catalog of refund opportunities)
-- =====================================================
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category public.opportunity_category NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    rules JSONB DEFAULT '{}'::jsonb,
    min_amount INTEGER DEFAULT 0,
    max_amount INTEGER DEFAULT 0,
    deadline_days INTEGER, -- days from event to deadline
    legal_reference TEXT, -- e.g., "UE 261/2004"
    template_email TEXT,
    template_pec TEXT,
    template_form TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Everyone can read active opportunities (public catalog)
CREATE POLICY "Anyone can view active opportunities" ON public.opportunities
    FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage opportunities" ON public.opportunities
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- USER_OPPORTUNITIES TABLE (user matched opportunities)
-- =====================================================
CREATE TABLE public.user_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
    status public.opportunity_status DEFAULT 'found' NOT NULL,
    estimated_amount INTEGER DEFAULT 0,
    actual_amount INTEGER,
    deadline DATE,
    matched_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.user_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own opportunities" ON public.user_opportunities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities" ON public.user_opportunities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities" ON public.user_opportunities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities" ON public.user_opportunities
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user opportunities" ON public.user_opportunities
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- DOCUMENTS TABLE (uploaded/scanned documents)
-- =====================================================
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type public.document_type NOT NULL,
    source TEXT DEFAULT 'upload', -- 'gmail', 'outlook', 'upload'
    file_name TEXT,
    file_url TEXT,
    file_size INTEGER,
    parsed_data JSONB DEFAULT '{}'::jsonb,
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- GENERATED_REQUESTS TABLE (generated claim letters)
-- =====================================================
CREATE TABLE public.generated_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_opportunity_id UUID REFERENCES public.user_opportunities(id) ON DELETE CASCADE NOT NULL,
    type public.request_type NOT NULL,
    content TEXT NOT NULL,
    recipient TEXT,
    subject TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.generated_requests ENABLE ROW LEVEL SECURITY;

-- Function to check if user owns the user_opportunity
CREATE OR REPLACE FUNCTION public.owns_user_opportunity(_user_opportunity_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_opportunities
        WHERE id = _user_opportunity_id AND user_id = auth.uid()
    )
$$;

CREATE POLICY "Users can view own requests" ON public.generated_requests
    FOR SELECT USING (public.owns_user_opportunity(user_opportunity_id));

CREATE POLICY "Users can insert own requests" ON public.generated_requests
    FOR INSERT WITH CHECK (public.owns_user_opportunity(user_opportunity_id));

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    plan public.subscription_plan DEFAULT 'free' NOT NULL,
    status public.subscription_status DEFAULT 'active' NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Create default subscription (free)
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_opportunities_updated_at
    BEFORE UPDATE ON public.user_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_opportunities_user_id ON public.user_opportunities(user_id);
CREATE INDEX idx_user_opportunities_status ON public.user_opportunities(status);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_opportunities_active ON public.opportunities(active);