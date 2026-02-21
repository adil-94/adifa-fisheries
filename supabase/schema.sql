-- =====================================================
-- Adifa Fisheries - Database Schema and RLS Policies
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: expenses
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL CHECK (owner_name IN ('Adil', 'Aejaz')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date_desc ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_owner_name ON public.expenses(owner_name);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Authenticated users can read ALL rows
-- Both partners can view each other's expenses
CREATE POLICY "Authenticated users can view all expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: INSERT - Users can only insert their own expenses
-- user_id must match the authenticated user's ID
CREATE POLICY "Users can insert their own expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can only update their own expenses
-- user_id must match the authenticated user's ID
CREATE POLICY "Users can update their own expenses"
ON public.expenses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can only delete their own expenses
-- user_id must match the authenticated user's ID
CREATE POLICY "Users can delete their own expenses"
ON public.expenses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.expenses;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.expenses TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
