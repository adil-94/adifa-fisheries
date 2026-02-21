-- =====================================================
-- Adifa Fisheries - Fishery Management Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- TABLE: ponds
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ponds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pond_number INTEGER NOT NULL UNIQUE,
    name TEXT,
    size_acres NUMERIC(10, 2),
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: crops (Fish crop cycles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pond_id UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
    seed_type TEXT NOT NULL,
    seed_count INTEGER NOT NULL CHECK (seed_count > 0),
    seed_onboard_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    harvest_weight_kg NUMERIC(10, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: seed_checks (Monthly seed size checks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seed_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    average_size_cm NUMERIC(6, 2),
    average_weight_grams NUMERIC(8, 2),
    mortality_count INTEGER DEFAULT 0,
    health_status TEXT DEFAULT 'good' CHECK (health_status IN ('excellent', 'good', 'fair', 'poor')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: workers
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'caretaker',
    assigned_ponds INTEGER[],
    onboard_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    monthly_salary NUMERIC(10, 2) NOT NULL CHECK (monthly_salary >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: salary_payments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    payment_month DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications (For monthly reminders)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('seed_check', 'salary_due', 'harvest_due', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_crops_pond_id ON public.crops(pond_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_seed_checks_crop_id ON public.seed_checks(crop_id);
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON public.workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_status ON public.workers(status);
CREATE INDEX IF NOT EXISTS idx_salary_payments_worker_id ON public.salary_payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ponds: Everyone can view, authenticated can modify
ALTER TABLE public.ponds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ponds"
ON public.ponds FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ponds"
ON public.ponds FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ponds"
ON public.ponds FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete ponds"
ON public.ponds FOR DELETE TO authenticated USING (true);

-- Crops: Everyone can view, users can modify their own
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view crops"
ON public.crops FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own crops"
ON public.crops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops"
ON public.crops FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops"
ON public.crops FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed Checks: Everyone can view, users can modify their own
ALTER TABLE public.seed_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view seed checks"
ON public.seed_checks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own seed checks"
ON public.seed_checks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seed checks"
ON public.seed_checks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seed checks"
ON public.seed_checks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Workers: Everyone can view, users can modify their own
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view workers"
ON public.workers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own workers"
ON public.workers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workers"
ON public.workers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workers"
ON public.workers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Salary Payments: Everyone can view, users can modify their own
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view salary payments"
ON public.salary_payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own salary payments"
ON public.salary_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salary payments"
ON public.salary_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own salary payments"
ON public.salary_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notifications: Users can only see their own
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert notifications"
ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- TRIGGERS: Auto-update updated_at
-- =====================================================
CREATE TRIGGER set_updated_at_ponds
    BEFORE UPDATE ON public.ponds
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_crops
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_workers
    BEFORE UPDATE ON public.workers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_salary_payments
    BEFORE UPDATE ON public.salary_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.ponds TO authenticated;
GRANT ALL ON public.crops TO authenticated;
GRANT ALL ON public.seed_checks TO authenticated;
GRANT ALL ON public.workers TO authenticated;
GRANT ALL ON public.salary_payments TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

-- =====================================================
-- INSERT DEFAULT PONDS
-- =====================================================
INSERT INTO public.ponds (pond_number, name, status) VALUES
    (1, 'Pond 1', 'active'),
    (2, 'Pond 2', 'active'),
    (3, 'Pond 3', 'active'),
    (4, 'Pond 4', 'active'),
    (5, 'Pond 5', 'active'),
    (6, 'Pond 6', 'active'),
    (7, 'Pond 7', 'active'),
    (8, 'Pond 8', 'active'),
    (9, 'Pond 9', 'active'),
    (10, 'Pond 10', 'active')
ON CONFLICT (pond_number) DO NOTHING;
